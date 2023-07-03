import { FC, ReactNode } from "react"
import Footer from "./Footer"
import Header from "./Header"

interface Props {
  children: ReactNode
}
const Layout: FC<Props> = ({ children }) => {
  return (
    <>
      <div className="">
        <Header />
        <div className="app-body">{children}</div>
        <Footer />
      </div>
    </>
  )
}

export default Layout
