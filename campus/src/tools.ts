export function random<T> (array: Array<T>): T | undefined {
    if (! array.length) return;
    return array[Math.floor(Math.random() * array.length)];
}

export function later<T> (fn: () => T): Promise<T> {
    return new Promise<T>((r, rej) => {
        setTimeout(() => {
            try {
                r(fn());
            } catch (err) {
                rej(err);
            }
        }, 1000)
    })
}

export async function wait (ms: number): Promise<void> {
    return new Promise ((r) => {
        setTimeout(() => r(), ms)
    });
}

export function download (title: string, content: string): void {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', title);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}