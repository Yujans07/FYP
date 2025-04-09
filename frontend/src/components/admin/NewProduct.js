import React, { Fragment, useState, useEffect } from "react";

import MetaData from "../layout/MetaData";
import Sidebar from "./Sidebar";

import { useAlert } from "react-alert";
import { useDispatch, useSelector } from "react-redux";
import { newProduct, clearErrors } from "../../actions/productActions";
import { NEW_PRODUCT_RESET } from "../../constants/productConstants";

const NewProduct = ({ history }) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState(0);
  const [images, setImages] = useState([]);
  const [imagesPreview, setImagesPreview] = useState([]);
  const [processor, setProcessor] = useState("");
  const [ram, setRam] = useState("");
  const [storage, setStorage] = useState("");
  const [display, setDisplay] = useState("");
  const [battery, setBattery] = useState("");
  const [camera, setCamera] = useState("");
  const [operatingSystem, setOperatingSystem] = useState("");
  const [network, setNetwork] = useState("");

  const categories = [
    "Samsung",
    "Apple",
    "Xiaomi",
    "OnePlus",
    "Oppo",
    "Vivo",
    "Realme",
    "Google",
    "Others"
  ];

  const alert = useAlert();
  const dispatch = useDispatch();

  const { loading, error, success } = useSelector((state) => state.newProduct);

  useEffect(() => {
    if (error) {
      alert.error(error);
      dispatch(clearErrors());
    }

    if (success) {
      history.push("/admin/products");
      alert.success("Product created successfully");
      dispatch({ type: NEW_PRODUCT_RESET });
    }
  }, [dispatch, alert, error, success, history]);

  const submitHandler = (e) => {
    e.preventDefault();

    // Basic validation
    if (!name || !price || !description || !category || !stock) {
      alert.error("Please fill all required fields");
      return;
    }

    // Check if images are selected
    if (images.length === 0) {
      alert.error("Please select at least one image");
      return;
    }

    // Validate price
    if (isNaN(price) || price <= 0) {
      alert.error("Please enter a valid price");
      return;
    }

    // Validate stock
    if (isNaN(stock) || stock < 0) {
      alert.error("Please enter a valid stock quantity");
      return;
    }

    const formData = new FormData();
    formData.set("name", name);
    formData.set("price", price);
    formData.set("description", description);
    formData.set("category", category);
    formData.set("stock", stock);

    // Add specifications to the form data
    formData.set("processor", processor);
    formData.set("ram", ram);
    formData.set("storage", storage);
    formData.set("display", display);
    formData.set("battery", battery);
    formData.set("camera", camera);
    formData.set("operatingSystem", operatingSystem);
    formData.set("network", network);

    images.forEach((image) => {
      formData.append("images", image);
    });

    dispatch(newProduct(formData));
  };

  const onChange = (e) => {
    const files = Array.from(e.target.files);

    setImagesPreview([]);
    setImages([]);

    files.forEach((file) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (reader.readyState === 2) {
          setImagesPreview((oldArray) => [...oldArray, reader.result]);
          setImages((oldArray) => [...oldArray, reader.result]);
        }
      };

      reader.readAsDataURL(file);
    });
  };

  return (
    <Fragment>
      <MetaData title={"New Product"} />
      <div className="row">
        <div className="col-12 col-md-2">
          <Sidebar />
        </div>

        <div className="col-12 col-md-10">
          <Fragment>
            <div className="wrapper my-5">
              <form
                className="shadow-lg"
                onSubmit={submitHandler}
                encType="multipart/form-data"
              >
                <h1 className="mb-4">New Product</h1>

                <div className="form-group">
                  <label htmlFor="name_field">Name</label>
                  <input
                    type="text"
                    id="name_field"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="price_field">Price</label>
                  <input
                    type="text"
                    id="price_field"
                    className="form-control"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description_field">Description</label>
                  <textarea
                    className="form-control"
                    id="description_field"
                    rows="8"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                </div>

                <div className="form-group">
                  <label htmlFor="category_field">Category</label>
                  <select
                    className="form-control"
                    id="category_field"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="stock_field">Stock</label>
                  <input
                    type="number"
                    id="stock_field"
                    className="form-control"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                  />
                </div>

                {/* Input fields for laptop specifications */}
                <div className="form-group">
                  <label htmlFor="operatingsystem_field">Operating System</label>
                  <input
                    type="text"
                    id="operatingsystem_field"
                    className="form-control"
                    value={operatingSystem}
                    onChange={(e) => setOperatingSystem(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="ram_field">RAM</label>
                  <input
                    type="text"
                    id="ram_field"
                    className="form-control"
                    value={ram}
                    onChange={(e) => setRam(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="storage_field">Storage</label>
                  <input
                    type="text"
                    id="storage_field"
                    className="form-control"
                    value={storage}
                    onChange={(e) => setStorage(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="display_field">Display</label>
                  <input
                    type="text"
                    id="display_field"
                    className="form-control"
                    value={display}
                    onChange={(e) => setDisplay(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="battery_field">Battery</label>
                  <input
                    type="text"
                    id="battery_field"
                    className="form-control"
                    value={battery}
                    onChange={(e) => setBattery(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="camera_field">Camera</label>
                  <input
                    type="text"
                    id="camera_field"
                    className="form-control"
                    value={camera}
                    onChange={(e) => setCamera(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="network_field">Network</label>
                  <input
                    type="text"
                    id="network_field"
                    className="form-control"
                    value={network}
                    onChange={(e) => setNetwork(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Images</label>

                  <div className="custom-file">
                    <input
                      type="file"
                      name="product_images"
                      className="custom-file-input"
                      id="customFile"
                      onChange={onChange}
                      multiple
                    />
                    <label className="custom-file-label" htmlFor="customFile">
                      Choose Images
                    </label>
                  </div>

                  {imagesPreview.map((img) => (
                    <img
                      src={img}
                      key={img}
                      alt="Images Preview"
                      className="mt-3 mr-2"
                      width="55"
                      height="52"
                    />
                  ))}
                </div>

                <button
                  id="login_button"
                  type="submit"
                  className="btn btn-block py-3"
                  disabled={loading ? true : false}
                >
                  CREATE
                </button>
              </form>
            </div>
          </Fragment>
        </div>
      </div>
    </Fragment>
  );
};

export default NewProduct;
