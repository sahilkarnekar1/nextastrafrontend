import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ImageTable.css';
import { toast } from 'react-toastify';
import { API_BASE_URL } from './api/api';

const ImageTable = () => {
  const [images, setImages] = useState([]);
  const token = localStorage.getItem('authToken');


  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/images`, {
        headers: {
          'x-auth-token': token
        }
      });
      setImages(response.data);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast.error('Failed to fetch images');
    }
  };

  const deleteImage = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/images/${id}`, {
        headers: {
          'x-auth-token': token
        }
      });
      toast.success('Image deleted');
      setImages(images.filter(img => img._id !== id)); 
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  return (
    <div className="image-table-container">
      <h2>User Uploaded Images</h2>
      {images.length === 0 ? (
        <p>No images uploaded yet.</p>
      ) : (
        <table className="image-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Image</th>
              <th>Uploaded At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {images.map((img, index) => (
              <tr key={img._id}>
                <td>{index + 1}</td>
                <td>
                  <img src={img.image} alt={`upload-${index}`} style={{ width: '100px', height: 'auto' }} />
                </td>
                <td>{new Date(img.createdAt).toLocaleString()}</td>
                <td>
                  <button onClick={() => deleteImage(img._id)} className="delete-btn">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ImageTable;
