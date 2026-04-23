import React from 'react';
import "./ProductCard.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt,faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
// Destructuring props for a single product display
import tomato from "../assets/tomato.jpg"
const ProductCard = ({ product,onDelete }) => {
  console.log(product);
  const navigate = useNavigate();
  const { 
    _id, 
    ProductName, 
    Description, 
    PricePerUnit, 
    QuantityAvailable, 
    UnitType, 
    Status, 
    images
  } = product;

  // Function to determine stock status class
  const getStockClass = () => {
    console.log("hi",Status)
    if (Status === "Low Stock") return 'stock-low';
    if (Status === 'Available') return 'stock-available';
    return '';
  };
  
  // Function for edit/delete actions (placeholders)
  const handleEdit = () => {
    navigate(`/farmer/edit-product`,{state:product});
  }
  const handleDelete = () => console.log(`Deleting product ${id}`);

  return (
    <div className="product-card">
      {/* Product Image */}
      <img src={images[0]} alt={ProductName} className="product-image" />
      
      {/* Stock Status Badge */}
      <span className={`status-badge ${getStockClass()}`}>
        {Status}
      </span>

      <div className="product-info">
        <h3 className="product-name">{ProductName}</h3>
        <p className="product-description">{Description}</p>
        
        <div className="product-details-row">
          {/* Price */}
          <span className="product-price">
            ₹ {PricePerUnit} /{UnitType}
          </span>
          {/* Stock */}
          <span className="product-stock">
            Stock: {QuantityAvailable} {UnitType}
          </span>
        </div>
        
        {/* Actions */}
        <div className="product-actions">
          <button onClick={handleEdit} className="action-button">
            <FontAwesomeIcon icon={faPencilAlt} color='blue'/>
          </button>
          <button onClick={onDelete} className="action-button">
            <FontAwesomeIcon icon={faTrashAlt} color='red'/>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
