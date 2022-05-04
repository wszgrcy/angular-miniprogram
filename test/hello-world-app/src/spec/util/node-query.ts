export function nodeExist(
  query: WechatMiniprogram.SelectorQuery,
  selector: string
) {
  return new Promise<boolean>((res, rej) => {
    try {
      query
        .select(selector)
        .context((data) => {
          res(!!data);
        })
        .exec();
    } catch (error) {
      rej(error);
    }
  });
}

export function fields(
  query: WechatMiniprogram.SelectorQuery,
  selector: string,
  fields: WechatMiniprogram.Fields
) {
  return new Promise<any>((res, rej) => {
    try {
      query
        .select(selector)
        .fields(fields, (data) => {
          res(data);
        })
        .exec();
    } catch (error) {
      rej(error);
    }
  });
}
