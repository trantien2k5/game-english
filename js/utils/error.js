// utils/error.js

export function withErrorBoundary(fn, name = "UnknownFunction") {
    return function (...args) {
        try {
            return fn.apply(this, args);
        } catch (error) {
            console.error(`[Error in ${name}]:`, error);
            // Có thể mở rộng để toast thông báo lỗi lên màn hình nếu cần
            alert(`Đã xảy ra lỗi hệ thống trong quá trình xử lý (${name}). Vui lòng xem Console.`);
            throw error; // Ném tiếp nếu cần
        }
    };
}

export function asyncErrorBoundary(fn, name = "UnknownAsyncFunction") {
    return async function (...args) {
        try {
            return await fn.apply(this, args);
        } catch (error) {
            console.error(`[Async Error in ${name}]:`, error);
            alert(`Đã xảy ra lỗi hệ thống trong quá trình xử lý (${name}). Vui lòng xem Console.`);
            throw error;
        }
    };
}
