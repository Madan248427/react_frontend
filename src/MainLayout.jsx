"use client";

import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./pages/Sidebar/Sidebar";

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <>
      <Sidebar open={sidebarOpen} toggle={toggleSidebar} />
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}

      <div
        className="main-content"
        style={{
          marginLeft: "260px", // leave space for sidebar on desktop
          transition: "margin-left 0.3s ease",
        }}
      >
        <Outlet />
      </div>
    </>
  );
};

export default MainLayout;
