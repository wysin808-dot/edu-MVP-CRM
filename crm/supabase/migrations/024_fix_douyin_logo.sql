-- 抖音的 douyin 图标在库里取不到（404）；抖音=TikTok 同 logo，改用 tiktok slug
UPDATE platforms SET logo_url = 'https://cdn.simpleicons.org/tiktok' WHERE id = '抖音';
