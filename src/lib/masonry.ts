export function splitArray<T>(array: T[], parts: number): T[][] {
    const result: T[][] = Array.from({ length: parts }, () => []);
    array.forEach((item, i) => {
        result[i % parts].push(item);
    });
    return result;
}
