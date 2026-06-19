-- 平台官方 logo（图片 URL，emoji 作为回退）
ALTER TABLE platforms ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- 给现有平台按名字自动配上官方 logo（Simple Icons CDN，默认品牌色）
UPDATE platforms SET logo_url = 'https://cdn.simpleicons.org/xiaohongshu' WHERE id = '小红书' AND logo_url IS NULL;
UPDATE platforms SET logo_url = 'https://cdn.simpleicons.org/douyin'      WHERE id = '抖音'   AND logo_url IS NULL;
UPDATE platforms SET logo_url = 'https://cdn.simpleicons.org/wechat'      WHERE id = '视频号' AND logo_url IS NULL;
UPDATE platforms SET logo_url = 'https://cdn.simpleicons.org/wechat'      WHERE id = '公众号' AND logo_url IS NULL;
UPDATE platforms SET logo_url = 'https://cdn.simpleicons.org/zhihu'       WHERE id = '知乎'   AND logo_url IS NULL;
UPDATE platforms SET logo_url = 'https://cdn.simpleicons.org/youtube'     WHERE id = 'Google/YouTube' AND logo_url IS NULL;
UPDATE platforms SET logo_url = 'https://cdn.simpleicons.org/facebook'    WHERE id = 'Facebook/IG' AND logo_url IS NULL;

NOTIFY pgrst, 'reload schema';
