// This component is used to add a product to the marketplace and show the user's cUSD balance

// Importing the dependencies
import { useEffect, useState } from "react"
// import ethers to convert the product price to wei
import { ethers } from "ethers"
// Import the useAccount and useBalance hooks to get the user's address and balance
import { useAccount, useBalance } from "wagmi"
// Import the toast library to display notifications
import { toast } from "react-toastify"
// Import the useDebounce hook to debounce the input fields
import { useDebounce } from "use-debounce"
// Import our custom useContractSend hook to write a product to the marketplace contract
import { useContractSend } from "@/hooks/contract/useContractWrite"
// Import the erc20 contract abi to get the cUSD balance
import erc20Instance from "../abi/erc20.json"
// Import Balance from the Balance component
import { Balance } from "./Balance"
// Import Modal, Input from antd to display the modal
import { Modal, Input } from "antd"

// import useProducts
import { useProducts } from "@/hooks/State/useProducts"
import { useContractCall } from "@/hooks/contract/useContractRead"

// Define the AddProductModal component
const AddProductModal = () => {
  // Use the useProducts hook to refetch and get the latest products
  const { getProducts, products } = useProducts()
  // The visible state is used to toggle the visibility of the modal
  const [visible, setVisible] = useState(false)
  // The following states are used to store the values of the input fields
  const [productName, setProductName] = useState("")
  const [productPrice, setProductPrice] = useState<string | number>(0)
  const [productImage, setProductImage] = useState("")
  const [productDescription, setProductDescription] = useState("")
  const [productLocation, setProductLocation] = useState("")
  const [availableProducts, setAvailableProducts] = useState<number | string>(0)

  // The following states are used to debounce the input fields
  const [debouncedProductName] = useDebounce(productName, 500)
  const [debouncedProductPrice] = useDebounce(productPrice, 500)
  const [debouncedProductImage] = useDebounce(productImage, 500)
  const [debouncedProductDescription] = useDebounce(productDescription, 500)
  const [debouncedProductLocation] = useDebounce(productLocation, 500)
  const [debouncedAvailableProducts] = useDebounce(availableProducts, 500)
  const [loading, setLoading] = useState("")
  const [displayBalance, setDisplayBalance] = useState(false)

  // Check if all the input fields are filled
    const isDisabled =
    productName &&
    productPrice &&
    productImage &&
    productLocation &&
    productDescription &&
    availableProducts

  // Validate a url
  function isValidUrl(url:string) {
    let isValid = false;

    try {
      const parsedUrl = new URL(url);
      isValid = true;
    } catch (error) {
      isValid = false;
    }

    return isValid;
  }

  // Check if all the input fields are filled
   const isComplete = () => {
    if (productName.replace(/^[ ]+|[ ]+$/g, '').length < 2) {
      toast.warn("Please enter valid product name (2 characters or more)")
      return false;
    }
    if (!isValidUrl(productImage)) {
      toast.warn("Please enter a valid image url")
      return false;
    }
    if (productDescription.replace(/^[ ]+|[ ]+$/g, '').split(" ").length < 2) {
      toast.warn("Please enter a valid product description (2 words or more)")
      return false;
    }
    if (productLocation.replace(/^[ ]+|[ ]+$/g, '').length < 2) {
      toast.warn("Please enter a valid product location")
      return false;
    }
    if (Number(productPrice) < 1) {
      toast.warn("Please enter a valid product price (> 0)")
      return false;
    }
    if (Number(availableProducts) < 1) {
      toast.warn("Please enter a valid number of products available (> 0)")
      return false;
    }
    return true
  }

  // Clear the input fields after the product is added to the marketplace
  const clearForm = () => {
    setProductName("")
    setProductPrice(0)
    setProductImage("")
    setProductDescription("")
    setProductLocation("")
    setAvailableProducts(0)
  }

  // Convert the product price to wei
  const productPriceInWei = ethers.utils.parseEther(
    `${debouncedProductPrice.toString() || 0}`
  )

  // Use the useContractSend hook to use our writeProduct function on the marketplace contract and add a product to the marketplace
  const { writeAsync: createProduct } = useContractSend("writeProduct", [
    debouncedProductName,
    debouncedProductImage,
    debouncedProductDescription,
    debouncedProductLocation,
    productPriceInWei,
    debouncedAvailableProducts,
  ])

  // Use the useContractCall hook to read how many products are in the marketplace contract
  const { data } = useContractCall("getProductsLength", [], true)
  const productLength = data ? Number(data.toString()) : 0

  // Define function that handles the creation of a product through the marketplace contract
  const handleCreateProduct = async () => {
    if (!createProduct) {
      throw "Failed to create product"
    }
    setLoading("Creating...")
    if (!isComplete()) throw new Error("Please fill all fields")
    // Create the product by calling the writeProduct function on the marketplace contract
    const purchaseTx = await createProduct()
    setLoading("Waiting for confirmation...")
    // Wait for the transaction to be mined
    await purchaseTx.wait()
    // Close the modal and clear the input fields after the product is added to the marketplace
    getProducts(productLength + 1)
    console.log(products?.length, productLength + 1)
    setVisible(false)
    clearForm()
  }

  // Define function that handles the creation of a product, if a user submits the product form
  const addProduct = async (e: any) => {
    e.preventDefault()
    try {
      // Display a notification while the product is being added to the marketplace
      await toast.promise(handleCreateProduct(), {
        pending: "Creating product...",
        success: "Product created successfully",
        error: "Something went wrong. Try again.",
      })

      // Display an error message if something goes wrong
    } catch (e: any) {
      console.log({ e })
      toast.error(e?.message || "Something went wrong. Try again.")
      // Clear the loading state after the product is added to the marketplace
    } finally {
      setLoading("")
    }
  }

  // Get the user's address and balance
  const { address, isConnected } = useAccount()
  const { data: cusdBalance } = useBalance({
    address,
    token: erc20Instance.address as `0x${string}`,
    watch: true,
  })

  // If the user is connected and has a balance, display the balance
  useEffect(() => {
    if (isConnected && cusdBalance) {
      setDisplayBalance(true)
      return
    }
    setDisplayBalance(false)
  }, [cusdBalance, isConnected])

  // Define the JSX that will be rendered
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        flexWrap: "wrap",
      }}
    >
      <div>
        {/* Add Product Button that opens the modal */}
        <button
          type="button"
          onClick={() => setVisible(true)}
          className="btn"
          style={{ color: "snow" }}
        >
          + Add Product
        </button>
        <Modal
          title="Add Product"
          open={visible}
          okText={loading ? loading : "Create"}
          okButtonProps={{
            disabled: !!loading || !isDisabled || !createProduct,
          }}
          onCancel={() => setVisible(false)}
          onOk={addProduct}
          maskStyle={{ backdropFilter: "blur(15px)" }}
          bodyStyle={{ marginTop: 20 }}
        >
          {/* Add Product Modal */}
          <form>
            <div>
              <div>
                {/* Input fields for the product */}
                <div>
                  <label>Product Name</label>
                  <Input
                    style={{ marginBottom: 10 }}
                    onChange={(e) => {
                      setProductName(e.target.value)
                    }}
                    required
                    type="text"
                    value={productName}
                  />

                  <label>Product Image (URL)</label>
                  <Input
                    style={{ marginBottom: 10 }}
                    onChange={(e) => {
                      setProductImage(e.target.value)
                    }}
                    required
                    type="text"
                    value={productImage}
                  />

                  <label>Product Description</label>
                  <Input
                    style={{ marginBottom: 10 }}
                    onChange={(e) => {
                      setProductDescription(e.target.value)
                    }}
                    required
                    type="text"
                    value={productDescription}
                  />

                  <label>Product Location</label>
                  <Input
                    style={{ marginBottom: 10 }}
                    onChange={(e) => {
                      setProductLocation(e.target.value)
                    }}
                    required
                    type="text"
                    value={productLocation}
                  />

                  <label>Product Price (cUSD)</label>
                  <Input
                    style={{ marginBottom: 10 }}
                    onChange={(e) => {
                      setProductPrice(e.target.value)
                    }}
                    required
                    type="number"
                    value={productPrice}
                  />

                  <label>Number of Products in Stock</label>
                  <Input
                    style={{ marginBottom: 10 }}
                    onChange={(e) => {
                      setAvailableProducts(e.target.value)
                    }}
                    required
                    type="number"
                    value={availableProducts}
                  />
                </div>
              </div>
            </div>
          </form>
        </Modal>
      </div>

      {/* Display the user's cUSD balance */}
      {displayBalance && <Balance cusdBalance={cusdBalance} />}
    </div>
  )
}

export default AddProductModal
