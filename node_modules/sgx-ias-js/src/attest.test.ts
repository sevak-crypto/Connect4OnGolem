import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { parseHex, toU16 } from "./types";
import { parse_measurement } from "./sgx";
import { AttestationVerdict, AttestationVerifier } from "./attest";

dayjs.extend(duration);

const IAS_REPORT = '{"nonce":"some nonce","id":"31209355433493617787376776503240433872","timestamp":"2020-10-06T08:52:53.347575","version":4,"epidPseudonym":"Itmg0J96ogakfocRkBJTgQpKMR/vxHuzGzjBc4e7MOLi5YFG7MpdPvxc4ig9Kwr5JSCzB/LFoRC35Pns2g+hqHHSO67EJ7kJw8FBUSnYYWxOrJn/RnKPO/V9NyLL04KOYnFZG6WJR8ocK/TmHv9IhX0VvBHuOzuwlHV6eJk075Y=","advisoryURL":"https://security-center.intel.com","advisoryIDs":["INTEL-SA-00161","INTEL-SA-00320","INTEL-SA-00329","INTEL-SA-00220","INTEL-SA-00270","INTEL-SA-00293","INTEL-SA-00233"],"isvEnclaveQuoteStatus":"GROUP_OUT_OF_DATE","platformInfoBlob":"1502006504000900000F0F02040101070000000000000000000B00000B000000020000000000000B398400622A16A0D18310FE44F83C3759D80D9A509ADF3A9E3DF8912C35236289A76C9A02E31CBF7EC9BBE866A4C2B14976AF5F1F2F67432A910CAC8F9F1B2E443D","isvEnclaveQuoteBody":"AgABADkLAAALAAoAAAAAAGVa+jP6pbnMXp4kH6IpuZQAAAAAAAAAAAAAAAAAAAAACBD//wECAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAAAAAAAAAfAAAAAAAAAIn9CW9E4gK8MNf1FfUWauX3xTcHygIXbNBzU+wynQBOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABXexgNvNrje9nyZEQYnjunithb0DUVvyb1xEVcUoSyFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACoAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABjhc64dNI6h8/p+VxDIHTPKpGbcBcVdFaW/ntInWb2KW3oezUl5+GYyfwk1q80UOE8TjaarYTesWc/aUoWB1Ul"}';
const IAS_SIG_HEX = `
31fb8c591d9d4d4f71611c9f829a889be5c19857da86036181de37f966ea
26838f57bfb197da250d609443956b93771dbf1f29921c83698eb4c593ba
e26f4a428e3fe62811ec83b0fb1e3626103487f961630961842aed567d9a
3b6778b8e2bd03d889b97d6b985a65058bbebd63022c4bb162ad045bfd55
b86fb6fc9c4e19cfaff6c5503b6e1a49c58da10ad2fea7b2332c94129b5c
01495b021bf7af1db7c504d1ae4f26b4894aa45104734ac9eb16cd438b80
cb24c0b0757dbb05ebccfe8d2d72c223564c0a66227fe4c07a58dac93272
2d81969f95d424b372b64ead2d697388dfa0da21fe5f99ec13171bd12f2c
40e238ae25805879bd11f0c4267d3b5a
`;
const EVIDENCE = {
    report: IAS_REPORT,
    signature: parseHex(IAS_SIG_HEX.trim().replace("\n", "")),
};

const verifier = (): AttestationVerifier => AttestationVerifier.from(EVIDENCE);

test('input evidence', () => {
    expect(verifier().verify().verdict).toEqual(AttestationVerdict.Ok)
});

test('data', () => {
    let result = verifier()
        .data(new Uint8Array([0xde, 0xad, 0xc0, 0xde]))
        .data(new Uint8Array([0xca, 0xfe, 0xba, 0xbe]))
        .verify();
    expect(result.verdict).toEqual(AttestationVerdict.Ok);

    result = verifier()
        .data(new Uint8Array([0xde, 0xad, 0xc0, 0xde]))
        .data(new Uint8Array([0xca, 0xfe, 0xba, 0xba]))
        .verify();
    expect(result.verdict).not.toEqual(AttestationVerdict.Ok);
});

test('nonce', () => {
    let result = verifier().nonce("some nonce").verify();
    expect(result.verdict).toEqual(AttestationVerdict.Ok);

    result = verifier().nonce("some bad nonce").verify();
    expect(result.verdict).not.toEqual(AttestationVerdict.Ok);
});

test('mrenclave', () => {
    let mr = parse_measurement("89fd096f44e202bc30d7f515f5166ae5f7c53707ca02176cd07353ec329d004e");
    let result = verifier().mr_enclave(mr).verify();
    expect(result.verdict).toEqual(AttestationVerdict.Ok);

    mr = parse_measurement("89fd096f44e202bc30d7f515f5166ae5f7c53707ca02176cd07353ec329d004f");
    result = verifier().mr_enclave(mr).verify();
    expect(result.verdict).not.toEqual(AttestationVerdict.Ok);
});

test('mrenclave[]', () => {
    let mrs = [
        parse_measurement("89fd096f44e202bc30d7f515f5166ae5f7c53707ca02176cd07353ec329d004e"),
        parse_measurement("89fd096f44e202bc30d7f515f5166ae5f7c53707ca02176cd07353ec329d004f"),
    ];
    let result = verifier().mr_enclave_list(mrs).verify();
    expect(result.verdict).toEqual(AttestationVerdict.Ok);

    mrs = [
        parse_measurement("89fd096f44e202bc30d7f515f5166ae5f7c53707ca02176cd07353ec329d004d"),
        parse_measurement("89fd096f44e202bc30d7f515f5166ae5f7c53707ca02176cd07353ec329d004f"),
    ];
    result = verifier().mr_enclave_list(mrs).verify();
    expect(result.verdict).not.toEqual(AttestationVerdict.Ok);
});

test('mrsigner', () => {
    let mr = parse_measurement("577b180dbcdae37bd9f26444189e3ba78ad85bd03515bf26f5c4455c5284b214");
    let result = verifier().mr_signer(mr).verify();
    expect(result.verdict).toEqual(AttestationVerdict.Ok);

    mr = parse_measurement("477b180dbcdae37bd9f26444189e3ba78ad85bd03515bf26f5c4455c5284b214");
    result = verifier().mr_signer(mr).verify();
    expect(result.verdict).not.toEqual(AttestationVerdict.Ok);
});

test('mrsigner[]', () => {
    let mrs = [
        parse_measurement("577b180dbcdae37bd9f26444189e3ba78ad85bd03515bf26f5c4455c5284b214"),
        parse_measurement("477b180dbcdae37bd9f26444189e3ba78ad85bd03515bf26f5c4455c5284b214"),
    ];
    let result = verifier().mr_signer_list(mrs).verify();
    expect(result.verdict).toEqual(AttestationVerdict.Ok);

    mrs = [
        parse_measurement("377b180dbcdae37bd9f26444189e3ba78ad85bd03515bf26f5c4455c5284b214"),
        parse_measurement("477b180dbcdae37bd9f26444189e3ba78ad85bd03515bf26f5c4455c5284b214"),
    ];
    result = verifier().mr_signer_list(mrs).verify();
    expect(result.verdict).not.toEqual(AttestationVerdict.Ok);
});

test('isvprodid', () => {
    let result = verifier().isv_prod_id(toU16(42)).verify();
    expect(result.verdict).toEqual(AttestationVerdict.Ok);

    result = verifier().isv_prod_id(toU16(0)).verify();
    expect(result.verdict).not.toEqual(AttestationVerdict.Ok);
});

test('isvsvn', () => {
    let result = verifier().isv_svn(toU16(1)).verify();
    expect(result.verdict).toEqual(AttestationVerdict.Ok);

    result = verifier().isv_svn(toU16(0)).verify();
    expect(result.verdict).not.toEqual(AttestationVerdict.Ok);
});

test('outdated', () => {
    let result = verifier().not_outdated().verify();
    expect(result.verdict).not.toEqual(AttestationVerdict.Ok);
});

test('debug', () => {
    let result = verifier().not_debug().verify();
    expect(result.verdict).not.toEqual(AttestationVerdict.Ok);
});

test('age', () => {
    let result = verifier().max_age(60).verify();
    expect(result.verdict).not.toEqual(AttestationVerdict.Ok);
});

test('all', () => {
    let result = verifier()
        .data(new Uint8Array([0xde, 0xad, 0xc0, 0xde]))
        .data(new Uint8Array([0xca, 0xfe, 0xba, 0xbe]))
        .nonce("some nonce")
        .mr_enclave(parse_measurement(
            "89fd096f44e202bc30d7f515f5166ae5f7c53707ca02176cd07353ec329d004e",
        ))
        .mr_signer(parse_measurement(
            "577b180dbcdae37bd9f26444189e3ba78ad85bd03515bf26f5c4455c5284b214",
        ))
        .isv_prod_id(toU16(42))
        .isv_svn(toU16(1))
        .verify();
    expect(result.verdict).toEqual(AttestationVerdict.Ok);
});
