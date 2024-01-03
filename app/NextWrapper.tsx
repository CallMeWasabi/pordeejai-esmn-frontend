"use client"
import { NextUIProvider } from "@nextui-org/react";
import React from "react";

const NextWrapper = ({ children }: { children: React.ReactNode }) => {
  return <NextUIProvider>{children}</NextUIProvider>;
};

export default NextWrapper;
