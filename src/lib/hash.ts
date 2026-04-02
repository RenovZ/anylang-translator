/**
 * 使用 DJB2 变体计算字符串哈希值。
 */
export const hashCode = (str: string) => {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash >>> 0;
};
