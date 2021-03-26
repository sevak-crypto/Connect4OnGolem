export default interface Callable<T, R> {
    (...T: any[]): R;
}
