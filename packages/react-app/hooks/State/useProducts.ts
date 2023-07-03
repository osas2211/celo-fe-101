import { useContext, useState, useEffect } from "react"
import { ProductsContext } from "../../context/productsContext"
import { useContractCall } from "../contract/useContractRead"

export const useProducts = () => {
  const { error, loading, success, clear, getProducts, products, setProducts } =
    useContext(ProductsContext)
  // Use the useContractCall hook to read how many products are in the marketplace contract
  const { data } = useContractCall("getProductsLength", [], true)

  // Refetch Products on Hook Call.
  useEffect(() => {
    const productLength = data ? Number(data.toString()) : 0
    getProducts(productLength)
    console.log("Call getProducts", products?.length)
  }, [])

  return {
    error,
    loading,
    success,
    clear,
    getProducts,
    setProducts,

    // products array is reversed to show the latest products first.
    products: products?.reverse(),
  }
}
