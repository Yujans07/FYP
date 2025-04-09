import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";
import RandomProductsSection from "./RandomProductsSection"; // Import the RandomProductsSection component

const CompareProducts = () => {
  const [products, setProducts] = useState([]);

  const [selectedProductIds, setSelectedProductIds] = useState([]);

  useEffect(() => {
    const fetchSelectedProducts = async () => {
      try {
        console.log("Fetching selected products...");
        const queryParams = new URLSearchParams(window.location.search);
        const productIds = queryParams.getAll("productIds");
        console.log("Product IDs:", productIds);
        const response = await axios.get(
          `/api/v1/products/compare?productIds=${productIds.join(",")}`,
          {
            withCredentials: true,
          }
        );
        console.log("Response Data:", response.data);
        setProducts(response.data.products);
      } catch (error) {
        console.error("Error fetching selected products:", error);
      }
    };

    fetchSelectedProducts();
  }, []);

  console.log("Products:", products);

  const handleUncheckToggle = (productId) => {
    console.log("Toggle unchecked for productId:", productId);
  };

  const handleRemoveProduct = (productId) => {
    const updatedProducts = products.filter(
      (product) => product._id !== productId
    );
    setProducts(updatedProducts);
  };

  const handleToggleProduct = (productId) => {
    // Check if the product is already selected
    const isSelected = selectedProductIds.includes(productId);
    if (isSelected) {
      // If selected, remove it from the selectedProductIds
      setSelectedProductIds(
        selectedProductIds.filter((id) => id !== productId)
      );
    } else {
      // If not selected, add it to the selectedProductIds
      setSelectedProductIds([...selectedProductIds, productId]);
    }
  };

  return (
    <div className="container">
      <div className="col">
        <div style={{ paddingTop: "15px" }}>
          <h2 className="text-center mb-4">Find Your Perfect Match</h2>
        </div>
      </div>
      <div className="row justify-content-center">
        {products.map((product) => (
          <div className={`col-sm-10 col-md-4 my-3`} key={product._id}>
            <ProductCard
              product={product}
              handleToggleProduct={handleToggleProduct}
              isSelected={selectedProductIds.includes(product._id)}
            />
          </div>
        ))}
      </div>

      <div className="row justify-content-center">
        <div className="col">
          <div className="table-responsive">
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <td>Name</td> {/* Placeholder cell */}
                  {products.map((product) => (
                    <th key={product._id}>{product.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Processor</td>
                  {products.map((product) => (
                    <td key={product._id}>{product.processor}</td>
                  ))}
                </tr>
                <tr>
                  <td>RAM</td>
                  {products.map((product) => (
                    <td key={product._id}>{product.ram}</td>
                  ))}
                </tr>
                <tr>
                  <td>Storage</td>
                  {products.map((product) => (
                    <td key={product._id}>{product.storage}</td>
                  ))}
                </tr>
                <tr>
                  <td>Display</td>
                  {products.map((product) => (
                    <td key={product._id}>{product.display}</td>
                  ))}
                </tr>
                <tr>
                  <td>Battery</td>
                  {products.map((product) => (
                    <td key={product._id}>{product.battery}</td>
                  ))}
                </tr>
                <tr>
                  <td>Camera</td>
                  {products.map((product) => (
                    <td key={product._id}>{product.camera}</td>
                  ))}
                </tr>
                <tr>
                  <td>Operating System</td>
                  {products.map((product) => (
                    <td key={product._id}>{product.operatingSystem}</td>
                  ))}
                </tr>
                <tr>
                  <td>Network</td>
                  {products.map((product) => (
                    <td key={product._id}>{product.network}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Include RandomProductsSection component here */}
      <RandomProductsSection />
    </div>
  );
};

export default CompareProducts;
