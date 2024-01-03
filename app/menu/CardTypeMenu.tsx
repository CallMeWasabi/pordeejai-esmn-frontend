"use client";
import React from "react";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/react";
import { MenuTypeQuery } from "./page";

const CardTypeMenu = ({ menuType }: { menuType: MenuTypeQuery }) => {
  return (
    <Card>
      <CardHeader className="flex justify-center items-center text-lg h-[100px]">
        {menuType.name}
      </CardHeader>
    </Card>
  );
};

export default CardTypeMenu;
