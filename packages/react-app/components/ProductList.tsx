// This component is used to display all the products in the marketplace

// Importing the dependencies
import { useState } from "react"
// Import the useContractCall hook to read how many products are in the marketplace via the contract
import { useContractCall } from "@/hooks/contract/useContractRead"
// Import the Product and Alert components
import Product from "@/components/Product"
import ErrorAlert from "@/components/alerts/ErrorAlert"
import LoadingAlert from "@/components/alerts/LoadingAlert"
import SuccessAlert from "@/components/alerts/SuccessAlert"
import { useProducts } from "@/hooks/State/useProducts"

// import Row and Pagination from antd
import { Row, Pagination } from "antd"

// Define the ProductList component
const ProductList = () => {
  const { error, loading, success, clear, getProducts, products } =
    useProducts()

  // Return the JSX for the component
  return (
    <div>
      {/* If there is an alert, display it */}
      {error && <ErrorAlert message={error} clear={clear!} />}
      {success && <SuccessAlert message={success} />}
      {loading && <LoadingAlert message={loading} />}
      {/* Display the products */}
      <div className="">
        <h1 style={{ fontSize: 24, margin: "1.5rem 0", color: "#fff" }}>
          Products
        </h1>
        <Row gutter={[16, 20]}>
          {/* Loop through the products and return the Product component */}
          {products}
        </Row>
      </div>
    </div>
  )
}

export default ProductList
