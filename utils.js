const overrideCustom = ({from, to, comment = "---"}) => {
    resourcesOverrider.push({
        from: from,
        to: to,
        comment: comment
    })
}

const overrideSkin = ({element, from="default", to="default"}) => {
	if (from == to) {
		return;
	} else if (!element) {
		console.error("[Overrider] element не указан.");
		return;
	} else if (!textures[element]) {
		console.error(`[Overrider] ${element} не найден.`);
		return;
	} else if (!textures[element][to]) {
		console.error(`[Overrider] ${to} на ${element} не найден.`);
		return;
	} else if (!textures[element][from]) {
		console.error(`[Overrider] ${from} на ${element} не найден.`);
		return;
	} else {
		const paths = ['object.a3d', 'lightmap.webp', 'tracks.webp', 'wheels.webp', 'meta.info', 'object.3ds'].map(file => ({
			from: `${textures[element][from]}/${file}`,
			to: `${resourcesURL}/${textures[element][to]}/${file}`,
			comment: `${element} ${from} -> ${to} | ${file}`
		}));
		resourcesOverrider.push(...paths);
	}
};

const overrideCustomPaint = ({from, image, frame = null, comment = "---"}) => {
    resourcesOverrider.push({
        from: `${from}/image.webp`,
        to: image,
        comment: comment + ` | image.webp`
    });
    if (frame) {
        resourcesOverrider.push({
            from: `${from}/frame.json`,
            to: frame,
            comment: comment + ` | frame.json`
        });
    }
};

// FIXME: Устаревшие ссылки, обновить
/*
const overrideSky = (type, {top, bottom, left, right, back, front}) => {
    if (type == "space") {
        resourcesOverrider.push({
            from: `0/16721/110/123/30545000606213`,
            to: top,
            comment: `Sky "${type}" top side`
        }, {
            from: `0/16721/110/124/30545000606433`,
            to: bottom,
            comment: `Sky "${type}" bottom side`
        }, {
            from: `0/16721/107/207/30545000605173`,
            to: front,
            comment: `Sky "${type}" front side`
        }, {
            from: `0/16721/110/121/30545000607406`,
            to: back,
            comment: `Sky "${type}" back side`
        }, {
            from: `0/16721/110/120/30545000605752`,
            to: left,
            comment: `Sky "${type}" left side`
        }, {
            from: `0/16721/110/122/30545000606256`,
            to: right,
            comment: `Sky "${type}" right side`
        }, );
    }
};
*/
