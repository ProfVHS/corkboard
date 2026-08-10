import Modal from "../../ui/Modal/Modal.tsx";
import React, { useCallback, useRef, useState } from "react";
import { Button } from "../../ui/Button/Button.tsx";
import "./CropModal.scss"

type NaturalSize = {
    w: number;
    h: number;
}

type Offset = {
    x: number;
    y: number;
}

type DragState = {
    startX: number;
    startY: number;
    startOffset: Offset;
}

type CropModal = {
    imagePath: string;
    onConfirm: (blob: Blob) => void;
    onClose: () => void;
};

export const CropImageModal = ({imagePath, onConfirm, onClose}: CropModal) => {
    const [naturalSize, setNaturalSize] = useState<NaturalSize | null>(null);
    const [baseScale, setBaseScale] = useState<number>(1);
    const [zoom, setZoom] = useState<number>(1);
    const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });

    const imgRef = useRef<HTMLImageElement>(null);
    const dragState = useRef<DragState | null>(null);

    const clampOffset = useCallback(
        (next: Offset, currentZoom: number, size: NaturalSize | null): Offset => {
            if (!size) return next;
            const scale = baseScale * currentZoom;
            const scaledW = size.w * scale;
            const scaledH = size.h * scale;
            const maxX = Math.max(0, (scaledW - 280) / 2);
            const maxY = Math.max(0, (scaledH - 280) / 2);
            return {
                x: Math.min(maxX, Math.max(-maxX, next.x)),
                y: Math.min(maxY, Math.max(-maxY, next.y)),
            };
        },
        [baseScale],
    );

    const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        dragState.current = {
            startX: e.clientX,
            startY: e.clientY,
            startOffset: offset,
        };
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!dragState.current || !naturalSize) return;
        const dx = e.clientX - dragState.current.startX;
        const dy = e.clientY - dragState.current.startY;
        const next: Offset = {
            x: dragState.current.startOffset.x + dx,
            y: dragState.current.startOffset.y + dy,
        };
        setOffset(clampOffset(next, zoom, naturalSize));
    };

    const onPointerUp = () => {
        dragState.current = null;
    };

    const handleImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const target = e.currentTarget;
        const w = target.naturalWidth;
        const h = target.naturalHeight;
        const scale = Math.max(280 / w, 280 / h);
        setNaturalSize({ w, h });
        setBaseScale(scale);
        setZoom(1);
        setOffset({ x: 0, y: 0 });
    };

    const imgStyle: React.CSSProperties = naturalSize
        ? {
              width: naturalSize.w * baseScale * zoom,
              height: naturalSize.h * baseScale * zoom,
              transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px)`,
          }
        : { display: "none" };

    const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const nextZoom = parseFloat(e.target.value);
        setZoom(nextZoom);
        if (naturalSize) {
            setOffset((prev) => clampOffset(prev, nextZoom, naturalSize));
        }
    };

    const handleSave = () => {
        if (!naturalSize || !imgRef.current) return;

        const canvas = document.createElement("canvas");
        canvas.width = 280;
        canvas.height = 280;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const exportScale = 1;
        const scale = baseScale * zoom * exportScale;
        const drawW = naturalSize.w * scale;
        const drawH = naturalSize.h * scale;

        const dx = 280 / 2 - drawW / 2 + offset.x * exportScale;
        const dy = 280 / 2 - drawH / 2 + offset.y * exportScale;

        ctx.save();
        ctx.drawImage(imgRef.current, dx, dy, drawW, drawH);
        ctx.restore();

        canvas.toBlob((blob) => {
            if(!blob) return;
            onConfirm(blob);
        }, 'image/jpeg');
    };

    return (
        <Modal onClose={() => onClose()} className="crop-modal">
            <Modal.Header>Crop Photo</Modal.Header>
            <Modal.Body>
                <div className="crop-modal__hint">Drag the photo to change the frame, and use the slider to zoom in.</div>
                <div
                    className="crop-modal__stage"
                    style={{ width: 280, height: 280 }}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerLeave={onPointerUp}
                >
                    <img ref={imgRef} src={imagePath} alt="" onLoad={handleImgLoad} style={imgStyle} className="crop-modal__image" draggable={false} />
                </div>
                <div className="crop-modal__zoom">
                    <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.01}
                        value={zoom}
                        onChange={handleZoomChange}
                        className="crop-modal__zoom-slider"
                        aria-label="Powiększenie"
                    />
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button color="outlined" onClick={() => onClose()}>Cancel</Button>
                <Button color="secondary" onClick={handleSave}>Upload</Button>
            </Modal.Footer>
        </Modal>
    );
};
