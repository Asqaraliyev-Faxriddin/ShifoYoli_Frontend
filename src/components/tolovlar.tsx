"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
} from "@mui/material";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "SUPERADMIN" | "BEMOR" | "DOCTOR";
}

interface Wallet {
  id: string;
  userId: string;
  balance: string;
  user: User;
}

interface Payment {
  id: string;
  amount: string;
  type: string;
  createdAt: string;
  wallet: Wallet;
  source: string;
}

interface PaymentsResponse {
  total: number;
  count: number;
  data: Payment[];
}

const Tolovlar: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const totalPages = Math.ceil(total / limit);

  // ------------------------
  // Foydalanuvchi profilini olish
  // ------------------------
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return router.push("/login");

        const { data } = await axios.get<{ data: User }>(
          "https://faxriddin.bobur-dev.uz/profile/my/profile",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUser(data.data);
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          router.push("/login");
        }
        console.error(err);
      }
    };

    fetchProfile();
  }, [router]);


  useEffect(() => {
    const fetchPayments = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return router.push("/login");

        const url =
          user.role === "SUPERADMIN"
            ? `https://faxriddin.bobur-dev.uz/payment/search?limit=${limit}&offset=${page}`
            : `https://faxriddin.bobur-dev.uz/payment/Payment/user?limit=${limit}&offset=${page}`;

        const { data } = await axios.get<PaymentsResponse>(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setPayments(data.data); // Har page yangilanishi bilan eski ma'lumot o'chadi
        setTotal(data.total);
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          router.push("/login");
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [user, page, router]);

  // ------------------------
  // Superadmin uchun tolovi qo'shish/deduct qilish
  // ------------------------
  const handleWalletAction = async (
    userId: string,
    amount: number,
    action: "add" | "deduct"
  ) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const url = `https://faxriddin.bobur-dev.uz/admin/wallet/${action}`;
      await axios.post(
        url,
        { userId, amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Amal bajarildi!");
    } catch (err) {
      console.error(err);
      alert("Xatolik yuz berdi");
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Tolovlar
      </Typography>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && payments.length === 0 && (
        <Typography align="center">Tolovlar topilmadi.</Typography>
      )}

      {!loading && payments.length > 0 && (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Foydalanuvchi</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Created At</TableCell>
                  {user?.role === "SUPERADMIN" && <TableCell>Action</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((payment, index) => (
                  <TableRow
                    key={`${payment.id}-${payment.wallet.user.id}-${index}`}
                  >
                    <TableCell>{(page - 1) * limit + index + 1}</TableCell>
                    <TableCell>
                      {payment.wallet.user.firstName}{" "}
                      {payment.wallet.user.lastName}
                    </TableCell>
                    <TableCell>{payment.wallet.user.email}</TableCell>
                    <TableCell>{payment.amount}</TableCell>
                    <TableCell>{payment.type}</TableCell>
                    <TableCell>
                      {new Date(payment.createdAt).toLocaleString()}
                    </TableCell>
                    {user?.role === "SUPERADMIN" && (
                      <TableCell>
                        <Button
                          sx={{ mr: 1 }}
                          variant="contained"
                          onClick={() =>
                            handleWalletAction(
                              payment.wallet.user.id,
                              5000,
                              "add"
                            )
                          }
                        >
                          Add 5000
                        </Button>
                        <Button
                          sx={{ mr: 1 }}
                          variant="contained"
                          color="error"
                          onClick={() =>
                            handleWalletAction(
                              payment.wallet.user.id,
                              5000,
                              "deduct"
                            )
                          }
                        >
                          Deduct 5000
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            sx={{ mt: 3 }}
          >
            <Button
              variant="contained"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Oldingi
            </Button>
            <Typography sx={{ alignSelf: "center" }}>
              Page {page} / {totalPages}
            </Typography>
            <Button
              variant="contained"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Keyingi →
            </Button>
          </Stack>
        </>
      )}
    </Box>
  );
};

export default Tolovlar;
