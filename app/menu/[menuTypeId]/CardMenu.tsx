"use client";
import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
} from "@nextui-org/react";
import { MenuQuery } from "../page";
import Link from "next/link";

const CardMenu = ({
  menu,
  menuTypeId,
}: {
  menu: MenuQuery;
  menuTypeId: number;
}) => {
  return (
    <Link
      href={{ pathname: `/menu/${menuTypeId}/order`, query: { id: menu.id } }}
    >
      <Card className="text-sm">
        <CardBody className="flex flex-col space-y-2">
          <h3>{menu.name}</h3>
          <p className="font-bold">฿{menu.price}</p>
          <p className="text-center opacity-70">คลิกเพื่อสั่งอาหาร {">>"}</p>
        </CardBody>
      </Card>
    </Link>
  );
};

export default CardMenu;
