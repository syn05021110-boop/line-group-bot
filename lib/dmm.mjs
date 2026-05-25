/**
 * DMM/FANZA Web Service API クライアント
 * 公式ドキュメント: https://affiliate.dmm.com/api/v3/itemlist.html
 *
 * 必要な環境変数:
 *   DMM_API_ID         アフィリエイト管理画面で発行する API ID
 *   DMM_AFFILIATE_ID   アフィリエイトID（例: foobar-990）
 */

const ITEMLIST_ENDPOINT = "https://api.dmm.com/affiliate/v3/ItemList";

/**
 * 商品一覧を取得する
 *
 * @param {object} opts
 * @param {string} opts.apiId           DMM API ID
 * @param {string} opts.affiliateId     アフィリエイトID
 * @param {string} [opts.site=FANZA]    DMM.com | FANZA
 * @param {string} [opts.service=digital]
 * @param {string} [opts.floor=videoa]  ジャンル（videoa = アダルト動画）
 * @param {number} [opts.hits=20]       取得件数（最大100）
 * @param {string} [opts.sort=rank]     rank | price | -price | date | review
 * @param {string} [opts.keyword]       検索キーワード
 * @param {number} [opts.offset=1]      検索開始位置
 * @returns {Promise<Array>} 整形済みアイテム配列
 */
export async function fetchItems({
  apiId,
  affiliateId,
  site = "FANZA",
  service = "digital",
  floor = "videoa",
  hits = 20,
  sort = "rank",
  keyword,
  offset = 1,
}) {
  if (!apiId || !affiliateId) {
    throw new Error("DMM_API_ID / DMM_AFFILIATE_ID が未設定です");
  }

  const params = new URLSearchParams({
    api_id: apiId,
    affiliate_id: affiliateId,
    site,
    service,
    floor,
    hits: String(hits),
    sort,
    offset: String(offset),
    output: "json",
  });
  if (keyword) params.set("keyword", keyword);

  const url = `${ITEMLIST_ENDPOINT}?${params}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`DMM API エラー: HTTP ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  if (data.result?.status && data.result.status !== 200) {
    throw new Error(`DMM API エラー: ${JSON.stringify(data.result)}`);
  }

  return (data.result?.items || []).map(normalizeItem);
}

function normalizeItem(item) {
  return {
    id: item.content_id,
    title: item.title,
    affiliateURL: item.affiliateURL,
    productURL: item.URL,
    imageURL: item.imageURL?.large || item.imageURL?.list || "",
    sampleImages: item.sampleImageURL?.sample_l?.image
      || item.sampleImageURL?.sample_s?.image
      || [],
    genres: (item.iteminfo?.genre || []).map((g) => g.name),
    actresses: (item.iteminfo?.actress || []).map((a) => a.name),
    maker: item.iteminfo?.maker?.[0]?.name || "",
    series: item.iteminfo?.series?.[0]?.name || "",
    date: item.date || "",
    review: item.review
      ? { count: Number(item.review.count), average: Number(item.review.average) }
      : null,
  };
}
