const repo_config = require("./js/repo-config");
const dayjs = require("dayjs");
const duration = require("dayjs/plugin/duration");
const { Executor, Task, utils, vm, WorkContext } = require("yajsapi");

const toBool = require("to-bool");
const WrappedEmitter = require("./wrapped-emitter");
//const { program } = require("commander");

const events = require("./sockets/event-emitter");
const ChessPath = require("./helpers/chess-temp-path-helper");
var fs = require("fs");
const { debuglog } = require("util");
const { getTaskIdHash } = require("./helpers/get-task-hash-id");
dayjs.extend(duration);

const { asyncWith, logUtils, range } = utils;
debugLog = (functionName, data) => {
    if (toBool(process.env.LOG_ENABLED_YAJSAPI_WORKER))
        if (data === undefined) console.log(`>>ChessWorker - ${functionName}`);
        else console.log(`>>ChessWorker::${functionName} ` + JSON.stringify(data, null, 4));
};

LogMoveData = (data) =>
    `[turnID]: ${data.turnId}, [gameId]: ${data.gameId}, [stepId]: ${data.stepId}`;

performGolemCalculations = async (moveData) => {
    const { chess, ...dataForLogger } = moveData;
    debugLog("performGolemCalculations", dataForLogger);
    let subnetTag = process.env.GOLEM_SUBNET;
    let driver = process.env.GOLEM_PAYMENT_DRIVER;
    debugLog(`Using subnet: ${subnetTag}`);
    const { gameId, stepId, depth } = moveData;
    const taskId = getTaskIdHash(gameId, stepId);
    var completed = false;

    events.emit("calculation_requested", { gameId, stepId });

    const paths = new ChessPath(gameId, stepId);
    // console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
    // console.log(paths);
    const _package = await vm.repo({
        image_hash: repo_config.docker_id,
        min_mem_gib: repo_config.min_ram,
        min_storage_gib: repo_config.min_disk,
        min_cpu_count: repo_config.min_cpu,
    });
    //console.log("####################" + paths.OutputFolder);
    if (!fs.existsSync(paths.OutputFolder)) {
        fs.mkdirSync(paths.OutputFolder, { recursive: true });
    }

    if (!fs.existsSync(paths.InputFolder)) {
        fs.mkdirSync(paths.InputFolder, { recursive: true });
    }

    // save fen position to file

    fs.writeFileSync(paths.ChessBoardFilePath, chess.ascii());
    fs.writeFileSync(
        paths.InputFilePath,
        taskId + "\n" + depth + "\n" + "position fen " + chess.fen(),
    );

    async function* worker(ctx, tasks) {
        for await (let task of tasks) {
            events.emit("calculation_started", { gameId, stepId });
            debugLog("*** worker starts // " + LogMoveData(moveData));
            //var task_id=task.data();
            debugLog(
                "*** sending chessboard [" +
                    paths.InputFilePath +
                    "]" +
                    " >> \n" +
                    fs.readFileSync(paths.InputFilePath, "utf8"),
            );

            ctx.send_file(paths.InputFilePath, "/golem/work/input.txt");
            ctx.run("/bin/sh", [
                "-c",
                "node /golem/code2/chess_engine/bestmove.js > /golem/work/output2.txt",
            ]);

            ctx.download_file("/golem/work/output.txt", paths.OutputFilePath);
            ctx.download_file("/golem/work/output2.txt", paths.OutputLogFilePath);
            debugLog("*** downloading result for depth (" + depth + ") ... ");
            yield ctx.commit({
                timeout: dayjs.duration({ seconds: 60 }).asMilliseconds(),
            });

            if (fs.readFileSync(paths.OutputFilePath, "utf8").includes("bestmove")) {
                task.accept_result(paths.OutputFilePath);
                debugLog("*** task completed succesfully !");
            } else {
                task.reject_result((msg = "invalid file"));
                debugLog("*** task rejected !");
            }
        }
        return;
    }

    const Subtasks = range(0, 1, 1);
    const timeout = dayjs.duration({ minutes: 8 }).asMilliseconds();

    const emitter = new WrappedEmitter(gameId, stepId);
    const engine = await new Executor({
        task_package: _package,
        max_workers: 13,
        timeout, //5 min to 30 min
        budget: "0.02",
        driver: driver,
        subnet_tag: subnetTag,
        network: "rinkeby",

        event_consumer: logUtils.logSummary(emitter.Process),
    });
    await asyncWith(engine, async (engine) => {
        for await (let subtask of engine.submit(
            worker,
            Subtasks.map((frame) => new Task(gameId * 10000 + stepId)),
        )) {
            if (fs.existsSync(subtask.result())) {
                const bestmove = ExtractBestMove(fs.readFileSync(subtask.result(), "utf8"));
                debuglog(
                    "*** result =====> ",
                    bestmove.move + " time: " + bestmove.time + ", depth:" + bestmove.depth,
                );
                completed = true;

                /*setTimeout(() => {
          //emitter.Stop();
          // engine.done();
        }, 360 * 1000);*/

                events.emit("calculation_completed", { gameId, stepId, bestmove });
                return true;
            } else {
                //engine.done();
                //emitter.Stop();
                return false;
            }
        }
    });
    //engine.done();
    //emitter.Stop();
    return completed;
};

module.exports = {
    performGolemCalculations,
};