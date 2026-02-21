"use client";

import { Routes, Route, Navigate } from "react-router-dom";

// Layout
import MainLayout from "./MainLayout"; // MainLayout includes <Chatbot /> + <Outlet />

// Auth / Public
import Login from "./pages/Login/Login";
import Register from "./pages/Registration/Register";
import ForgetPassword from "./pages/ForgotPassword/ForgotPassword";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailure from "./pages/PaymentFailure";
import UserLayout from "./UserLayout";

// Protected
import ProtectedRoute from "./context/ProtectedRoute";

// User Pages
import UserDashboard from "./User/Dashboard";
import BookListPage from "./pages/BookList/BookListPage";
import BookDetailPage from "./pages/BookDetails/BookDetail";
import IssuedBooks from "./pages/IssuedBooks/IssuedBooks";
import Notifications from "./pages/Notifications/Notifications";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";

// Employee/Admin Pages
import AddBook from "./pages/AddBook/AddBook";
import EditBook from "./pages/EditBook/EditBook";
import BookList from "./pages/BookList1/BookList1";
import BookDetail from "./pages/BookDetail/BookDetail";
import AdminBooks from "./pages/AdminBooks/AdminBooks";
import Transaction from "./pages/Transaction/Transaction";
import NoticePage from "./pages/Notice/NoticePage";

// Misc
import Unauthorized from "./pages/PageNotFound/NotFound";


function App() {
  return (
    <Routes>

      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* MainLayout wraps all pages including Chatbot */}
      <Route element={<MainLayout />}>

        {/* ============ PUBLIC ROUTES ============ */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/forgot-password" element={<ForgetPassword />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-failure" element={<PaymentFailure />} />

        {/* ============ USER PROTECTED ROUTES ============ */}
        <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
          <Route element={<UserLayout />}>
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/books" element={<BookListPage />} />
          <Route path="/books/:id" element={<BookDetailPage />} />
          <Route path="/issued-books" element={<IssuedBooks />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
        </Route>
        </Route>

        {/* ============ EMPLOYEE/ADMIN PROTECTED ROUTES ============ */}
        <Route element={<ProtectedRoute allowedRoles={["employee"]} />}>
        <Route element={<UserLayout />}>
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/add-book" element={<AddBook />} />
          <Route path="/edit-book/:id" element={<EditBook />} />
          <Route path="/book-list" element={<BookList />} />
          <Route path="/book/:id" element={<BookDetail />} />
          <Route path="/emp-books" element={<AdminBooks />} />
          <Route path="/transaction" element={<Transaction />} />
          <Route path="/notices" element={<NoticePage />} />
        </Route>
        </Route>

        {/* ============ SHARED PROTECTED ROUTES ============ */}
        <Route element={<ProtectedRoute allowedRoles={["user", "employee"]} />}>
        <Route element={<UserLayout />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
        </Route>
        </Route>

        {/* ============ FALLBACK / ERROR ROUTES ============ */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<div>Page Not Found</div>} />

      </Route>
    </Routes>
  );
}

export default App;