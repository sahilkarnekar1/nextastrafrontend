import React, { useRef, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Transformer } from 'react-konva';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as tf from '@tensorflow/tfjs';

const HomePage = () => {
  const fileInputRef = useRef();
  const [image, setImage] = useState(null);
  const [imageElement, setImageElement] = useState(null);
  const [objects, setObjects] = useState([]);
  const stageRef = useRef();
  const [selectedId, setSelectedId] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const img = new window.Image();
      img.src = URL.createObjectURL(file);
      img.onload = async () => {
        setImage(img);
        setImageElement(img);

        const model = await cocoSsd.load();
        const predictions = await model.detect(img);

        const formatted = predictions.map(pred => ({
          ...pred,
          x: pred.bbox[0],
          y: pred.bbox[1],
          width: pred.bbox[2],
          height: pred.bbox[3]
        }));

        setObjects(formatted);
      };
    }
  };

  const handleDragMove = (index, e) => {
    const updatedObjects = [...objects];
    updatedObjects[index] = {
      ...updatedObjects[index],
      x: e.target.x(),
      y: e.target.y(),
    };
    setObjects(updatedObjects);
  };

  const handleTransform = (index, node) => {
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);

    const updatedObjects = [...objects];
    updatedObjects[index] = {
      ...updatedObjects[index],
      x: node.x(),
      y: node.y(),
      width: Math.max(5, node.width() * scaleX),
      height: Math.max(5, node.height() * scaleY)
    };
    setObjects(updatedObjects);
  };

  const handleDelete = () => {
    if (selectedId !== null) {
      const updatedObjects = objects.filter((_, i) => i !== selectedId);
      setObjects(updatedObjects);
      setSelectedId(null);
    }
  };

  const handleDownload = () => {
    const uri = stageRef.current.toDataURL();
    const link = document.createElement('a');
    link.download = 'edited-image.png';
    link.href = uri;
    link.click();
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
      />

      <button onClick={handleDelete}>Delete Selected Object</button>
      <button onClick={handleDownload}>Download Image</button>

      {image && (
        <Stage width={window.innerWidth} height={window.innerHeight} ref={stageRef}>
          <Layer>
            <KonvaImage image={imageElement} />
            {objects.map((obj, i) => (
              <React.Fragment key={i}>
                <Rect
                  x={obj.x}
                  y={obj.y}
                  width={obj.width}
                  height={obj.height}
                  stroke="red"
                  strokeWidth={2}
                  draggable
                  onClick={() => setSelectedId(i)}
                  onTap={() => setSelectedId(i)}
                  onDragMove={(e) => handleDragMove(i, e)}
                  onTransformEnd={(e) => handleTransform(i, e.target)}
                />
                {selectedId === i && (
                  <Transformer
                    boundBoxFunc={(oldBox, newBox) => {
                      if (newBox.width < 5 || newBox.height < 5) {
                        return oldBox;
                      }
                      return newBox;
                    }}
                    nodes={[stageRef.current.findOne(`#object-${i}`)]}
                  />
                )}
              </React.Fragment>
            ))}
          </Layer>
        </Stage>
      )}
    </div>
  );
};

export default HomePage;
