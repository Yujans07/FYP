import React from "react";
import { useSelector } from "react-redux";
import ProductCard from "./ProductCard";

const RandomProductsSection = () => {
  // Selector to get all products from Redux store
  const { products } = useSelector((state) => state.products);

  // Function to get 4 random products from all products
  const getRandomProducts = (allProducts, count) => {
    const randomIndices = [];
    const randomProducts = [];
    while (randomIndices.length < count) {
      const index = Math.floor(Math.random() * allProducts.length);
      if (!randomIndices.includes(index)) {
        randomIndices.push(index);
        randomProducts.push(allProducts[index]);
      }
    }
    return randomProducts;
  };

  // Get 4 random products from all products
  const randomProducts = getRandomProducts(products, 8);

  return (
    <section id="random-products" className="container mt-4">
      <h2>Recommanded Products</h2>
      <div className="row justify-content-center">
        {randomProducts.map((product) => (
          <div className="col-sm-6 col-lg-3 my-4" key={product._id}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default RandomProductsSection;
