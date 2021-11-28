class PromiseUtils {
    static makeCancelable<T>(promise: Promise<T>) {
        let hasCanceled_ = false;

        const wrappedPromise: Promise<T> = new Promise((resolve, reject) => {
            promise.then(
                val => hasCanceled_ ? reject({isCanceled: true}) : resolve(val),
                error => hasCanceled_ ? reject({isCanceled: true}) : reject(error)
            );
        });

        return {
            promise: wrappedPromise,
            cancel() {
                hasCanceled_ = true;
            },
        };
    };
}

export default PromiseUtils;
