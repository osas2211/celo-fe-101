/* eslint-disable @next/next/no-img-element */
// This component displays and enables the purchase of a product

// Importing the dependencies
import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
// Import ethers to format the price of the product correctly
import { ethers } from "ethers"
// Import the useConnectModal hook to trigger the wallet connect modal
import { useConnectModal } from "@rainbow-me/rainbowkit"
// Import the useAccount hook to get the user's address
import { useAccount } from "wagmi"
// Import the toast library to display notifications
import { toast } from "react-toastify"
// Import our custom identicon template to display the owner of the product
import { identiconTemplate } from "@/helpers"
// Import our custom hooks to interact with the smart contract
import { useContractApprove } from "@/hooks/contract/useApprove"
import { useContractCall } from "@/hooks/contract/useContractRead"
import { useContractSend } from "@/hooks/contract/useContractWrite"

// Import Button, Tag, Column and Rate from antd
import { Button, Tag, Col, Rate } from "antd"
// import Location Icon from ant-icons
import { EnvironmentFilled } from "@ant-design/icons"
import { useProducts } from "@/hooks/State/useProducts"
// Define the interface for the product, an interface is a type that describes the properties of an object
interface Product {
  name: string
  price: number
  owner: string
  image: string
  description: string
  location: string
  sold: boolean
  availableProducts: number
}

// Define the Product component which takes in the id of the product and some functions to display notifications
const Product = ({ id, setError, setLoading, clear }: any) => {
  // Use the useProducts hook to refetch and get the latest products
  const { getProducts } = useProducts()
  // Use the useContractCall hook to read how many products are in the marketplace contract
  const { data } = useContractCall("getProductsLength", [], true)
  const productLength = data ? Number(data.toString()) : 0

  // Use the useAccount hook to store the user's address
  const { address } = useAccount()
  // Use the useContractCall hook to read the data of the product with the id passed in, from the marketplace contract
  const { data: rawProduct }: any = useContractCall("readProduct", [id], true)
  // Use the useContractSend hook to purchase the product with the id passed in, via the marketplace contract
  const { writeAsync: purchase } = useContractSend("buyProduct", [Number(id)])
  const [product, setProduct] = useState<Product | null>(null)
  // Use the useContractApprove hook to approve the spending of the product's price, for the ERC20 cUSD contract
  const { writeAsync: approve } = useContractApprove(
    product?.price?.toString() || "0"
  )
  // Use the useConnectModal hook to trigger the wallet connect modal
  const { openConnectModal } = useConnectModal()
  // Format the product data that we read from the smart contract
  const getFormatProduct = useCallback(() => {
    if (!rawProduct) return null
    setProduct({
      owner: rawProduct[0],
      name: rawProduct[1],
      image: rawProduct[2],
      description: rawProduct[3],
      location: rawProduct[4],
      price: Number(rawProduct[5]),
      sold: rawProduct[6].toString(),
      availableProducts: Number(rawProduct[7]),
    })
  }, [rawProduct])

  // Rating Description

  // Call the getFormatProduct function when the rawProduct state changes
  useEffect(() => {
    getFormatProduct()
  }, [getFormatProduct])

  // Define the handlePurchase function which handles the purchase interaction with the smart contract
  const handlePurchase = async () => {
    if (!approve || !purchase) {
      throw "Failed to purchase this product"
    }
    // Approve the spending of the product's price, for the ERC20 cUSD contract
    const approveTx = await approve()
    // Wait for the transaction to be mined, (1) is the number of confirmations we want to wait for
    await approveTx.wait(1)
    setLoading("Purchasing...")
    // Once the transaction is mined, purchase the product via our marketplace contract buyProduct function
    const res = await purchase()
    // Wait for the transaction to be mined
    await res.wait()
  }

  // Define the purchaseProduct function that is called when the user clicks the purchase button
  const purchaseProduct = async () => {
    setLoading("Approving ...")
    clear()

    try {
      // If the user is not connected, trigger the wallet connect modal
      if (!address && openConnectModal) {
        openConnectModal()
        return
      }
      // If the user is connected, call the handlePurchase function and display a notification
      await toast.promise(handlePurchase(), {
        pending: "Purchasing product...",
        success: "Product purchased successfully",
        error: "Failed to purchase product",
      })
      // Refetch Products after purchase.
      getProducts(productLength)
      // If there is an error, display the error message
    } catch (e: any) {
      console.log({ e })
      setError(e?.reason || e?.message || "Something went wrong. Try again.")
      // Once the purchase is complete, clear the loading state
    } finally {
      setLoading(null)
    }
  }

  // If the product cannot be loaded, return null
  if (!product) return null

  // Format the price of the product from wei to cUSD otherwise the price will be way too high
  const productPriceFromWei = ethers.utils.formatEther(product.price.toString())

  // Return the JSX for the product component
  return (
    <Col xs={24} sm={12} md={8} lg={8} xl={6} xxl={6}>
      <div className={"product-card"}>
        <p className="">
          <div className="">
            {/* Show the product image */}
            <img src={product.image} alt={"image"} className="product-image" />
            {/* Show the address of the product owner as an identicon and link to the address on the Celo Explorer */}
            <Link
              href={`https://explorer.celo.org/alfajores/address/${product.owner}`}
              className={""}
              style={{ borderRadius: "100%", display: "inline-block" }}
            >
              {identiconTemplate(product.owner)}
            </Link>
          </div>
          {/* Show the number of products sold */}
          <span className={""}>
            <Tag color="warning" style={{ fontSize: 16 }}>
              {product.sold} sold
            </Tag>
          </span>
          <div style={{ marginTop: 10 }}>
            <div className={""}>
              {/* Show the product name */}
              <p style={{ fontWeight: 500 }}>{product.name}</p>
              <div className={""}>
                {/* Show the product description */}
                <p style={{ fontWeight: 300 }} className="">
                  {product.description}
                </p>
              </div>
            </div>
            <div style={{ margin: "0.7rem 0", display: "flex" }}>
              <p>Stocks Available: </p>
              <Tag style={{ fontSize: 16, marginLeft: "0.5rem" }}>
                {product.availableProducts}
              </Tag>
            </div>
            <div>
              <div style={{ margin: "5px 0 20px 0" }}>
                {/* Show the product location */}
                <EnvironmentFilled style={{ color: "var(--color-primary)" }} />
                <small style={{ marginLeft: 10 }}>
                  <b>{product.location}</b>
                </small>
              </div>

              {/* Buy button that calls the purchaseProduct function on click */}
              <Button
                onClick={purchaseProduct}
                style={{ width: "100%" }}
                type="dashed"
                disabled={product.availableProducts === 0 ? true : false}
              >
                {/* Disable button and show sold out when the available stock is zero */}
                {product.availableProducts === 0 ? (
                  <>SOLD OUT</>
                ) : (
                  <>
                    {/* Show the product price in cUSD */}
                    Buy for {productPriceFromWei} cUSD
                  </>
                )}
              </Button>
            </div>
          </div>
        </p>
      </div>
    </Col>
  )
}

export default Product
