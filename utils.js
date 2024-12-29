const getCategory = (element) => {
    for (const [category, items] of categories) {
        if (items.includes(element)) {
            return category;
        }
    }
    return null;
};
const setSkin = (element, skin) => {
    const category = getCategory(element);
    if (!category || !defaultTextures[element]) {
        console.warn(`[Overrider] Unknown element: ${element}`);
        return;
    }
    resourcesOverrider.push(...filenames.map(file => ({
        from: `${defaultTextures[element]}/${file}`,
        to: baseToUrl
            .replace("{folder}", category)
            .replace("{element}", element)
            .replace("{skin}", skin)
            .replace("{file}", file),
        comment: `${element} -> ${skin} | ${file}`
    })));
};
const createPattern = url => new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
