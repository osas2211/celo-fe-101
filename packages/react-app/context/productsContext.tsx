import Product from "@/components/Product"
import { useState, createContext, Dispatch, SetStateAction } from "react"

export const ProductsContext = createContext<{
  error?: string
  success?: string
  loading?: string
  clear?: () => void
  // Added a productLength parameter to allow product list to update
  getProducts: (productLength: number) => JSX.Element[] | null
  setProducts?: Dispatch<SetStateAction<JSX.Element[] | null | undefined>>
  products?: JSX.Element[] | null
}>({ getProducts: () => [] })

export const ProductsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [products, setProducts] = useState<JSX.Element[] | null>()
  // Define the states to store the error, success and loading messages
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState("")
  // Define a function to clear the error, success and loading states
  const clear = () => {
    setError("")
    setSuccess("")
    setLoading("")
  }
  // Define a function to return the products
  const getProducts = (productLength: number) => {
    // If there are no products, return null
    if (!productLength) return null
    const products = []
    // Loop through the products, return the Product component and push it to the products array
    for (let i = 0; i < productLength; i++) {
      products.push(
        <Product
          key={i}
          id={i}
          setSuccess={setSuccess}
          setError={setError}
          setLoading={setLoading}
          loading={loading}
          clear={clear}
        />
      )
    }

    setProducts(products)
    // Return the reversed products array to show the latest products first.
    return products.reverse()
  }

  return (
    <ProductsContext.Provider
      value={{
        error,
        loading,
        success,
        clear,
        getProducts,
        setProducts,
        products,
      }}
    >
      {children}
    </ProductsContext.Provider>
  )
}
