import { useRoundRect } from "~/composables/useRoundRect";
import { usePlayerSettings } from "~/composables/usePlayerSettings";

export const useCameraRenderer = () => {
	const { cameraSettings } = usePlayerSettings();
	const lastCameraPosition = ref({ x: 0, y: 0 });
	const isMouseOverCamera = ref(false);

	const drawCamera = (
		ctx,
		cameraElement,
		canvasWidth,
		canvasHeight,
		dpr,
		mouseX,
		mouseY,
		dragPosition = null
	) => {
		if (!cameraElement || cameraElement.readyState < 2) return;

		// Kamera boyutlarını hesapla (kare olarak)
		const cameraWidth = (canvasWidth * cameraSettings.value.size) / 100;
		const cameraHeight = cameraWidth; // Kare yapmak için width = height

		// Kamera pozisyonunu hesapla
		let cameraX, cameraY;

		if (dragPosition) {
			// Sürükleme pozisyonunu kullan
			cameraX = dragPosition.x;
			cameraY = dragPosition.y;
		} else if (
			cameraSettings.value.followMouse &&
			mouseX !== undefined &&
			mouseY !== undefined
		) {
			// Mouse pozisyonuna göre kamera pozisyonunu ayarla
			cameraX = mouseX - cameraWidth / 2;
			cameraY = mouseY - cameraHeight / 2;
		} else {
			// Default pozisyon (sağ alt köşe) veya son pozisyonu kullan
			cameraX =
				lastCameraPosition.value.x || canvasWidth - cameraWidth - 20 * dpr;
			cameraY =
				lastCameraPosition.value.y || canvasHeight - cameraHeight - 20 * dpr;
		}

		// Sınırları kontrol et
		cameraX = Math.max(0, Math.min(canvasWidth - cameraWidth, cameraX));
		cameraY = Math.max(0, Math.min(canvasHeight - cameraHeight, cameraY));

		// Son pozisyonu kaydet
		lastCameraPosition.value = { x: cameraX, y: cameraY };

		// Context state'i kaydet
		ctx.save();

		// Gölge efekti
		if (cameraSettings.value.shadow > 0) {
			ctx.save();
			ctx.beginPath();
			useRoundRect(
				ctx,
				cameraX,
				cameraY,
				cameraWidth,
				cameraHeight,
				cameraSettings.value.radius * dpr
			);
			ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
			ctx.shadowBlur = cameraSettings.value.shadow * dpr;
			ctx.shadowOffsetX = 0;
			ctx.shadowOffsetY = 0;
			ctx.fillStyle = "#000000";
			ctx.fill();
			ctx.restore();
		}

		// Kamera alanını kırp ve radius uygula
		ctx.beginPath();
		useRoundRect(
			ctx,
			cameraX,
			cameraY,
			cameraWidth,
			cameraHeight,
			cameraSettings.value.radius * dpr
		);
		ctx.clip();

		// Mirror efekti için transform uygula
		if (cameraSettings.value.mirror) {
			ctx.translate(cameraX + cameraWidth, cameraY);
			ctx.scale(-1, 1);
			ctx.translate(-cameraX, -cameraY);
		}

		// Crop ayarlarını hesapla
		const crop = cameraSettings.value.crop;

		// Video aspect ratio'sunu koru
		const videoRatio = cameraElement.videoWidth / cameraElement.videoHeight;
		const targetHeight = cameraElement.videoHeight;
		const targetWidth = targetHeight;

		// Crop pozisyonunu hesapla
		const maxOffset = cameraElement.videoWidth - targetWidth;
		const sourceX = (maxOffset * crop.x) / (100 - crop.width);
		const sourceY = 0;

		// Kamerayı crop ayarlarıyla çiz
		ctx.drawImage(
			cameraElement,
			sourceX,
			sourceY,
			targetWidth,
			targetHeight,
			cameraX,
			cameraY,
			cameraWidth,
			cameraHeight
		);

		// Tıklanabilir alan için path ekle
		ctx.beginPath();
		useRoundRect(
			ctx,
			cameraX,
			cameraY,
			cameraWidth,
			cameraHeight,
			cameraSettings.value.radius * dpr
		);

		// Mouse'un kamera üzerinde olup olmadığını kontrol et
		if (mouseX !== undefined && mouseY !== undefined) {
			isMouseOverCamera.value = ctx.isPointInPath(mouseX, mouseY);
		}

		// Context state'i geri yükle
		ctx.restore();

		// Kamera alanının koordinatlarını döndür
		return { cameraX, cameraY, cameraWidth, cameraHeight };
	};

	return {
		drawCamera,
		isMouseOverCamera,
		lastCameraPosition,
	};
};
