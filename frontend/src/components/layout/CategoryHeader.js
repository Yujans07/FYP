// // CategoryHeader.js
// import React from "react";
// import { useDispatch } from "react-redux";
// import { getProducts } from "../../actions/productActions";

// const CategoryHeader = ({ categories }) => {
//   const dispatch = useDispatch();

//   const handleCategorySelect = (category) => {
//     dispatch(getProducts("", 1, [1, 2000], category, 0));
//   };

//   return (
//     <nav className="category-header navbar navbar-expand-lg navbar-light bg-light">
//       <div className="container">
//         <div className="navbar-nav">
//           {categories.map((category) => (
//             <div key={category} className="nav-item dropdown">
//               <span
//                 className="nav-link dropdown-toggle"
//                 id={`dropdown-${category}`}
//                 role="button"
//                 aria-haspopup="true"
//                 aria-expanded="false"
//               >
//                 {category}
//               </span>
//               <div
//                 className="dropdown-menu"
//                 aria-labelledby={`dropdown-${category}`}
//               >
//                 {/* Dropdown items for each category can be added here */}
//                 <span
//                   className="dropdown-item"
//                   onClick={() => handleCategorySelect(category)}
//                 >
//                   View Products
//                 </span>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default CategoryHeader;
