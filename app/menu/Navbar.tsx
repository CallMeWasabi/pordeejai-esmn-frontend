"use client";
import React from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
} from "@nextui-org/react";
import Link from "next/link";
import { FaShoppingCart } from "react-icons/fa";
import { useRouter } from "next/navigation";

const NavbarComponent = () => {
  const router = useRouter();

  return (
    <Navbar className="border-b-1">
      <NavbarBrand>
        <Link href={"/menu"}>
          <p className="font-bold text-inherit">ร้านพอดีใจ</p>
        </Link>
      </NavbarBrand>
      <NavbarContent justify="end">
        <NavbarItem>
          <Button
            color="success"
            href="/menu"
            variant="flat"
            onClick={() => router.back()}
          >
            กลับ
          </Button>
        </NavbarItem>
        <NavbarItem>
          <Button
            as={Link}
            color="success"
            href="/cart"
            variant="solid"
            className="text-white"
          >
            <FaShoppingCart />
          </Button>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
};

export default NavbarComponent;
