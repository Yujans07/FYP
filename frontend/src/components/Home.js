import React, { Fragment, useState, useEffect } from "react";
import Pagination from "react-js-pagination";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

import MetaData from "./layout/MetaData";
import Product from "./product/Product";
import Loader from "./layout/Loader";
import SelectedProductsBox from "./SelectedProductsBox";

import { useDispatch, useSelector } from "react-redux";
import { useAlert } from "react-alert";
import { getProducts } from "../actions/productActions";
import GetInTouchButton from "./layout/GetInTouchButton";
import GetInTouchForm from "./layout/GetInTouchForm";

const { createSliderWithTooltip } = Slider;
const Range = createSliderWithTooltip(Slider.Range);

const Home = ({ match }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [price, setPrice] = useState([1000, 1000000]);
  const [category, setCategory] = useState([]);
  const [rating, setRating] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const categories = [
    "Samsung",
    "Apple",
    "One Plus",
    "Xiaomi",
    "Google",
    "Vivo",
    "Oppo",
    "Huawei",
  ];

  const alert = useAlert();
  const dispatch = useDispatch();

  const {
    loading,
    products = [],
    error,
    productsCount = 0,
    resPerPage = 0,
    filteredProductsCount = 0,
  } = useSelector((state) => {
    console.log('Products from Redux store:', state.products);
    return state.products;
  });

  const keyword = match.params.keyword;

  useEffect(() => {
    if (error) {
      alert.error(error);
      return;
    }

    console.log('Current category:', category);
    console.log('Dispatching getProducts with params:', { keyword, currentPage, price, category, rating });
    dispatch(getProducts(keyword, currentPage, price, category, rating));
  }, [dispatch, alert, error, keyword, currentPage, price, category, rating]);

  function setCurrentPageNo(pageNumber) {
    setCurrentPage(pageNumber);
  }

  // Handle category selection
  const handleCategorySelect = (selectedCategory) => {
    console.log('Selected category:', selectedCategory);
    if (selectedCategory === null) {
      setCategory([]); // Clear all categories
      return;
    }
    
    // Allow multiple categories
    if (category.includes(selectedCategory)) {
      setCategory(category.filter((cat) => cat !== selectedCategory));
    } else {
      setCategory([...category, selectedCategory]);
    }
  };

  const handleSelectProduct = (product, isSelected) => {
    if (isSelected) {
      setSelectedProducts([...selectedProducts, product]);
    } else {
      const updatedProducts = selectedProducts.filter(
        (selectedProduct) => selectedProduct._id !== product._id
      );
      setSelectedProducts(updatedProducts);
    }
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts((prevSelectedProducts) =>
      prevSelectedProducts.filter((product) => product._id !== productId)
    );
  };

  const handleCancelComparison = () => {
    setSelectedProducts([]); // Clear selected products
  };

  const handleCheckboxChange = (productId) => {
    const updatedProducts = selectedProducts.map((product) =>
      product._id === productId
        ? { ...product, selected: !product.selected }
        : product
    );
    setSelectedProducts(updatedProducts);
  };

  const handleSearch = (keyword) => {
    dispatch(getProducts(keyword, currentPage, price, category, rating));
  };

  return (
    <Fragment>
      {loading ? (
        <Loader />
      ) : (
        <Fragment>
          <MetaData title={"Buy Best Products Online"} />

          <h1 id="products_heading">Latest Products</h1>

          <section id="products" className="container mt-4">
            <div className="row">
              {keyword ? (
                <Fragment>
                  <div className="card-size col-6 col-md-3 mt-5 mb-5">
                    <div className="card">
                      <h5 className="card-header">Filters</h5>
                      <div className="card-body">
                        <h6 className="card-subtitle mb-2 text-muted">Price</h6>
                        <Range
                          marks={{ 1000: `Rs1000`, 1000000: `Rs1000000` }}
                          min={1000}
                          max={1000000}
                          defaultValue={[1000, 1000000]}
                          tipFormatter={(value) => `Rs${value}`}
                          tipProps={{ placement: "top", visible: true }}
                          value={price}
                          onChange={(price) => setPrice(price)}
                        />

                        <hr className="my-5" />

                        <div className="mt-5">
                          <h6 className="card-subtitle mb-2 text-muted">
                            Ratings
                          </h6>

                          <ul className="pl-0">
                            {[5, 4, 3, 2, 1].map((star) => (
                              <li
                                style={{ cursor: "pointer", listStyleType: "none" }}
                                key={star}
                                onClick={() => setRating(star)}
                              >
                                <div className="rating-outer">
                                  <div
                                    className="rating-inner"
                                    style={{ width: `${star * 20}%` }}
                                  ></div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-6 col-md-9">
                    <div className="row">
                      {products.length > 0 ? (
                        products.map((product) => (
                          <Product
                            key={product._id}
                            product={product}
                            col={4}
                            handleSelectProduct={handleSelectProduct}
                            selectedProducts={selectedProducts}
                          />
                        ))
                      ) : (
                        <h3>No products found</h3>
                      )}
                    </div>
                  </div>
                </Fragment>
              ) : (
                products.length > 0 ? (
                  products.map((product) => (
                    <Product
                      key={product._id}
                      product={product}
                      col={3}
                      handleSelectProduct={handleSelectProduct}
                      selectedProducts={selectedProducts}
                    />
                  ))
                ) : (
                  <h3>No products available</h3>
                )
              )}
            </div>
          </section>

          {resPerPage <= productsCount && (
            <div className="d-flex justify-content-center mt-5">
              <Pagination
                activePage={currentPage}
                itemsCountPerPage={resPerPage}
                totalItemsCount={productsCount}
                onChange={setCurrentPageNo}
                nextPageText={"Next"}
                prevPageText={"Prev"}
                firstPageText={"First"}
                lastPageText={"Last"}
                itemClass="page-item"
                linkClass="page-link"
              />
            </div>
          )}

          {selectedProducts.length > 0 && (
            <div className="container mt-5 mb-5">
              <div className="row justify-content-center">
                <div className="col-lg-10">
                  <div className="shadow-lg p-4 mb-5 bg-white rounded">
                    <SelectedProductsBox
                      selectedProducts={selectedProducts}
                      handleRemoveProduct={handleRemoveProduct}
                      handleCancelComparison={handleCancelComparison}
                      handleCheckboxChange={handleCheckboxChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {showForm && <GetInTouchForm onClose={() => setShowForm(false)} />}
          <GetInTouchButton onClick={() => setShowForm(true)} />
        </Fragment>
      )}
    </Fragment>
  );
};

export default Home;
