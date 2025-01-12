import { useRoundRect } from "~/composables/useRoundRect";

export const useCameraRenderer = () => {
	// Kamera çizim fonksiyonu
	const drawCamera = (
		ctx,
		cameraElement,
		canvasWidth,
		canvasHeight,
		dpr,
		cameraSettings
	) => {
		if (!cameraElement || cameraElement.readyState < 2) return;

		// Kamera boyutlarını hesapla
		const cameraWidth = (canvasWidth * cameraSettings.size) / 100;
		const cameraHeight = (cameraWidth * 9) / 16; // 16:9 aspect ratio

		// Kamera pozisyonunu hesapla (sağ alt köşe)
		const cameraX = canvasWidth - cameraWidth - 20 * dpr;
		const cameraY = canvasHeight - cameraHeight - 20 * dpr;

		// Context state'i kaydet
		ctx.save();

		// Gölge efekti
		if (cameraSettings.shadow > 0) {
			ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
			ctx.shadowBlur = cameraSettings.shadow * dpr;
			ctx.shadowOffsetX = 0;
			ctx.shadowOffsetY = 0;
		}

		// Kamera alanını kırp ve radius uygula
		ctx.beginPath();
		useRoundRect(
			ctx,
			cameraX,
			cameraY,
			cameraWidth,
			cameraHeight,
			cameraSettings.radius * dpr
		);
		ctx.clip();

		// Kamerayı çiz
		ctx.drawImage(
			cameraElement,
			0,
			0,
			cameraElement.videoWidth,
			cameraElement.videoHeight,
			cameraX,
			cameraY,
			cameraWidth,
			cameraHeight
		);

		// Context state'i geri yükle
		ctx.restore();
	};

	return {
		drawCamera,
	};
};
