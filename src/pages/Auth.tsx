import { useState } from "react";

import { useMutation } from "@tanstack/react-query";

import { Link, useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

import { api } from "../api";

import { useAuthStore } from "../store";



type AuthResponse = {

  token: string;

  email: string;

  user_id?: string;

};



export const AuthPage = () => {

  const navigate = useNavigate();

  const setAuth = useAuthStore((s) => s.setAuth);

  const [mode, setMode] = useState<"login" | "register">("login");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [registeredUserId, setRegisteredUserId] = useState<string | null>(null);



  const mutation = useMutation({

    mutationFn: async () => {

      const path = mode === "login" ? "/auth/login" : "/auth/register";

      const { data } = await api.post(path, { email, password });

      return data as AuthResponse;

    },

    onSuccess: (data) => {

      setAuth(data.token, data.email);

      if (mode === "register" && data.user_id) {

        toast.success("Account created");

        setRegisteredUserId(String(data.user_id));

        return;

      }

      setRegisteredUserId(null);

      navigate("/dashboard");

    },

    onError: () => toast.error("Authentication failed"),

  });



  const copyUserId = async () => {

    if (!registeredUserId) return;

    try {

      await navigator.clipboard.writeText(registeredUserId);

      toast.success("User ID copied");

    } catch {

      toast.error("Copy failed");

    }

  };



  const switchMode = (next: "login" | "register") => {

    setMode(next);

    if (next === "login") setRegisteredUserId(null);

  };



  return (

    <main className="min-h-screen bg-bg-primary flex items-center justify-center px-4">

      <div className="w-full max-w-[400px] terminal-panel p-6">

        <h1 className="text-text-primary text-xl font-semibold mb-1">

          {mode === "login" ? "Sign in" : "Create account"}

        </h1>

        <p className="text-text-secondary text-sm mb-6">QuantRisk Engine</p>

        <div className="flex gap-6 border-b border-border mb-6">

          <button

            type="button"

            className={`pb-2 text-sm ${

              mode === "login" ? "text-text-primary border-b-2 border-accent-cyan" : "text-text-muted"

            }`}

            onClick={() => switchMode("login")}

          >

            Login

          </button>

          <button

            type="button"

            className={`pb-2 text-sm ${

              mode === "register" ? "text-text-primary border-b-2 border-accent-cyan" : "text-text-muted"

            }`}

            onClick={() => switchMode("register")}

          >

            Register

          </button>

        </div>

        <form

          className="flex flex-col gap-4"

          onSubmit={(e) => {

            e.preventDefault();

            mutation.mutate();

          }}

        >

          <input

            className="bg-bg-tertiary border border-border rounded-terminal px-3 py-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan"

            type="email"

            placeholder="Email"

            value={email}

            onChange={(e) => setEmail(e.target.value)}

            required

          />

          <input

            className="bg-bg-tertiary border border-border rounded-terminal px-3 py-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan"

            type="password"

            placeholder="Password"

            value={password}

            onChange={(e) => setPassword(e.target.value)}

            required

          />

          <button

            type="submit"

            disabled={mutation.isPending}

            className="w-full py-2.5 rounded-terminal bg-accent-green text-bg-primary font-semibold text-sm"

          >

            {mutation.isPending ? "Please wait…" : mode === "login" ? "Sign in" : "Register"}

          </button>

        </form>



        {registeredUserId ? (

          <div className="mt-4 rounded-terminal bg-bg-tertiary border border-border px-3 py-2.5 text-xs text-text-secondary">

            <div className="flex flex-wrap items-center gap-2">

              <span>Your User ID:</span>

              <code className="font-mono text-[11px] text-text-primary break-all">{registeredUserId}</code>

              <button

                type="button"

                className="ml-auto shrink-0 text-accent-cyan hover:underline"

                onClick={copyUserId}

              >

                Copy

              </button>

            </div>

            <button

              type="button"

              className="mt-3 w-full py-2 rounded-terminal border border-border text-text-primary text-sm hover:border-accent-cyan"

              onClick={() => navigate("/dashboard")}

            >

              Continue to dashboard

            </button>

          </div>

        ) : null}



        <p className="text-text-muted text-xs mt-4">

          <Link to="/" className="hover:text-accent-cyan">

            ← Back to home

          </Link>

        </p>

      </div>

    </main>

  );

};


