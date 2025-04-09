import React, { Fragment, useEffect } from "react";
import { Link } from "react-router-dom";
import { MDBDataTable } from "mdbreact";

import MetaData from "../layout/MetaData";
import Loader from "../layout/Loader";
import Sidebar from "./Sidebar";

import { useAlert } from "react-alert";
import { useDispatch, useSelector } from "react-redux";
import {
  getAdminProducts,
  deleteProduct,
  clearErrors,
} from "../../actions/productActions";

import { DELETE_PRODUCT_RESET } from "../../constants/productConstants";

const ProductList = ({ history }) => {
  const alert = useAlert();
  const dispatch = useDispatch();

  const { loading, error, products } = useSelector((state) => state.products);
  const { cartItems } = useSelector((state) => state.cart);

  const {
    error: deleteError,
    isDeleted,
    successMessage,
  } = useSelector((state) => state.product);

  console.log("isDeleted state:", isDeleted);

  useEffect(() => {
    dispatch(getAdminProducts());

    if (error) {
      alert.error(error);
      dispatch(clearErrors());
    }

    if (deleteError) {
      alert.error(deleteError);
      dispatch(clearErrors());
    }

    if (isDeleted) {
      history.push("/admin/products");
      alert.success(successMessage);
      dispatch({ type: DELETE_PRODUCT_RESET });
    }
  }, [dispatch, alert, error, deleteError, isDeleted, history, successMessage]);

  const deleteProductHandler = (id) => {
    dispatch(deleteProduct(id));
  };

  const setProducts = () => {
    const data = {
      columns: [
        {
          label: "ID",
          field: "id",
          sort: "asc",
        },
        {
          label: "Name",
          field: "name",
          sort: "asc",
        },
        {
          label: "Price",
          field: "price",
          sort: "asc",
        },
        {
          label: "Stock",
          field: "stock",
        },
        {
          label: "Actions",
          field: "actions",
          sort: "asc",
        },
      ],
      rows: [],
    };

    products.forEach((product) => {
      const isProductInCart = cartItems.some(
        (item) => item.product === product._id
      );

      const actions = (
        <Fragment>
          <Link
            to={`/admin/product/${product._id}`}
            className="btn btn-primary py-1 px-1"
          >
            <i className="fas fa-edit"></i>
          </Link>
          <button
            className="btn btn-danger py-1 px-2 ml-2"
            onClick={() => handleDelete(product._id, isProductInCart)}
          >
            <i className="fa fa-trash"></i>
          </button>
        </Fragment>
      );

      data.rows.push({
        id: product._id,
        name: product.name,
        price: `$${product.price}`,
        stock: product.stock,
        actions: actions,
      });
    });

    return data;
  };

  const handleDelete = (id, isProductInCart) => {
    if (isProductInCart) {
      alert.error("Product is in a user's cart. Cannot delete.");
    } else {
      deleteProductHandler(id);
    }
  };

  return (
    <Fragment>
      <MetaData title={"All Products"} />
      <div className="row">
        <div className="col-12 col-md-2">
          <Sidebar />
        </div>

        <div className="col-12 col-md-10">
          <Fragment>
            <h1 className="my-5">All Products</h1>

            {loading ? (
              <Loader />
            ) : (
              <MDBDataTable
                data={setProducts()}
                className="px-3"
                bordered
                striped
                hover
              />
            )}
          </Fragment>
        </div>
      </div>
    </Fragment>
  );
};

export default ProductList;
