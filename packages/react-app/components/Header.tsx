import { Disclosure } from "@headlessui/react"
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import Image from "next/image"

export default function Header() {
  return (
    <>
      <div className="header">
        <Image
          className="celo-logo"
          src="/logo2.svg"
          width="24"
          height="24"
          alt="Celo Logo"
          style={{ padding: 0, margin: 0 }}
        />
        <ConnectButton showBalance={false} />
      </div>
    </>
  )
}
