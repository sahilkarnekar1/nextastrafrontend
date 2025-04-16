import React, { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { Stage, Layer, Rect, Image as KonvaImage, Group, Text } from 'react-konva';
import { API_BASE_URL } from "../src/api/api.js";
import { toast } from 'react-toastify';
import axios from "axios"
import ImageTable from './ImageTable.jsx';
import ClipLoader from "react-spinners/ClipLoader";
import { useNavigate } from 'react-router-dom';

const App = () => {
  const [image, setImage] = useState(null);
  const [imageElement, setImageElement] = useState(null);
  const [objectImages, setObjectImages] = useState([]);
  const [greenRects, setGreenRects] = useState([]);
  const [loading, setLoading] = useState(false);
  const stageRef = useRef();
  const navigate = useNavigate();

useEffect(()=>{
if(!localStorage.getItem("authToken")){
  navigate("/login")
}
},[])

  useEffect(() => {
    if (image) {
      const img = new window.Image();
      img.src = URL.createObjectURL(image);
      img.onload = () => setImageElement(img);
    }
  }, [image]);

  useEffect(() => {
    const detectObjects = async () => {
      if (!imageElement) return;
      setLoading(true);

      const model = await cocoSsd.load();
      const predictions = await model.detect(imageElement);

      const objects = await Promise.all(
        predictions.map(async (pred, index) => {
          const [x, y, width, height] = pred.bbox;

          const objectCanvas = document.createElement('canvas');
          objectCanvas.width = width;
          objectCanvas.height = height;
          const objectCtx = objectCanvas.getContext('2d');
          objectCtx.drawImage(
            imageElement,
            x,
            y,
            width,
            height,
            0,
            0,
            width,
            height
          );

          const croppedImg = new window.Image();
          const dataUrl = objectCanvas.toDataURL();

          return new Promise(resolve => {
            croppedImg.onload = () => {
              resolve({
                id: Math.random().toString(36).substr(2, 9),
                x,
                y,
                width,
                height,
                image: croppedImg,
                originalX: x,
                originalY: y,
              });
            };
            croppedImg.src = dataUrl;
          });
        })
      );

      setObjectImages(objects);
      setLoading(false);
    };

    detectObjects();
  }, [imageElement]);

  const handleObjectDrag = (id, newX, newY) => {
    setObjectImages(prev =>
      prev.map(obj =>
        obj.id === id
          ? { ...obj, x: newX, y: newY }
          : obj
      )
    );

    setGreenRects(prev => {
      const existing = prev.find(r => r.id === id);
      if (existing) return prev;
      const draggedObj = objectImages.find(obj => obj.id === id);
      return [
        ...prev,
        {
          id,
          x: draggedObj.originalX,
          y: draggedObj.originalY,
          width: draggedObj.width,
          height: draggedObj.height,
          fillColor: 'green',
        },
      ];
    });
  };

  const handleObjectDelete = (id) => {
    setObjectImages(prev => prev.filter(obj => obj.id !== id));

    setGreenRects(prev => prev.filter(r => r.id !== id));

    const obj = objectImages.find(o => o.id === id);
    setGreenRects(prev => [
      ...prev,
      {
        id,
        x: obj.originalX,
        y: obj.originalY,
        width: obj.width,
        height: obj.height,
        fillColor: 'white',
      },
    ]);
  };

  const sendImageToAPI = async () => {
    setLoading(true);
    try {
      const stage = stageRef.current;
      const dataURL = stage.toDataURL({
        pixelRatio: 3,
        mimeType: 'image/png',
      });
  
      const response = await axios.post(
        `${API_BASE_URL}/images`,
        {
          image: dataURL
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem("authToken"), // JWT token
          }
        }
      );
  
      // ✅ axios doesn't have `.ok` like fetch — check status manually
      if (response.status === 201 || response.status === 200) {
        toast.success('Image sent successfully!');
        console.log('Image sent successfully:', response.data);
      } else {
        console.error('Unexpected response:', response);
      }
  
    } catch (error) {
      console.error('Error sending image:', error.response?.data || error.message);
      toast.error('Failed to send image');
    }finally{
      setLoading(false)
    }
  };
  

  return (
    <div style={{ padding: '20px' }}>
      <p>Edit Image And Store</p>
      <input
        type="file"
        accept="image/*"
        onChange={e => {
          setImage(e.target.files[0]);
          setObjectImages([]);
          setGreenRects([]);
        }}
      />
        <button
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
        }}
        onClick={sendImageToAPI} // API call on button click
      >
        Send Image to API
      </button>
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <ClipLoader color="#ffffff" size={60} />
        </div>
      )}
      {imageElement && (
        <Stage
          width={imageElement.width}
          height={imageElement.height}
          ref={stageRef}
        >
          <Layer>
            <KonvaImage image={imageElement} />
            {greenRects.map(rect => (
              <Rect
                key={rect.id}
                x={rect.x}
                y={rect.y}
                width={rect.width}
                height={rect.height}
                fill={rect.fillColor}
                opacity={0.4}
              />
            ))}
            {objectImages.map(obj => (
              <Group key={obj.id}>
                <Rect
                  x={obj.x}
                  y={obj.y}
                  width={obj.width}
                  height={obj.height}
                  stroke="green"
                  strokeWidth={4}
                  dash={[10, 5]}
                />
                <KonvaImage
                  image={obj.image}
                  x={obj.x}
                  y={obj.y}
                  width={obj.width}
                  height={obj.height}
                  draggable
                  onDragEnd={e =>
                    handleObjectDrag(obj.id, e.target.x(), e.target.y())
                  }
                />
                <Rect
                  x={obj.x + obj.width + 5}
                  y={obj.y}
                  width={50}
                  height={30}
                  fill="red"
                  opacity={0.7}
                  cornerRadius={5}
                  onClick={() => handleObjectDelete(obj.id)}
                />
               <Text
  x={obj.x + obj.width + 15}
  y={obj.y + 5}
  text="Delete"
  fontSize={14}
  fill="white"
  onClick={() => handleObjectDelete(obj.id)}
/>
              </Group>
            ))}
          </Layer>
        </Stage>
      )}

    <ImageTable/>
    </div>
  );
};

export default App;
