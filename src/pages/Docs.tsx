import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

import { Navbar } from "../components/layout/Navbar";
import { useAuthStore } from "../store";

const inferredBase =
  typeof window !== "undefined" ? `${window.location.protocol}//${window.location.hostname}:8000` : "http://localhost:8000";
const apiBase = import.meta.env.VITE_API_URL ?? inferredBase;
const openApiUrl = `${apiBase}/openapi.json`;

export const DocsPage = () => {
  const token = useAuthStore((s) => s.token);

  return (
    <main className="min-h-screen bg-bg-primary">
      <Navbar />
      <style>{`
        .docs-swagger,
        .docs-swagger .swagger-ui {
          background: #0a0a0a;
          color: #e5fdf1;
          font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
        }

        .docs-swagger .swagger-ui *,
        .docs-swagger .swagger-ui .info .title,
        .docs-swagger .swagger-ui .opblock-tag,
        .docs-swagger .swagger-ui .parameter__name,
        .docs-swagger .swagger-ui .parameter__type,
        .docs-swagger .swagger-ui table thead tr td,
        .docs-swagger .swagger-ui table thead tr th {
          font-family: inherit;
        }

        .docs-swagger .swagger-ui .scheme-container,
        .docs-swagger .swagger-ui .opblock,
        .docs-swagger .swagger-ui section.models,
        .docs-swagger .swagger-ui .model-box,
        .docs-swagger .swagger-ui .responses-inner,
        .docs-swagger .swagger-ui .opblock-body,
        .docs-swagger .swagger-ui .modal-ux {
          background: #101010;
          border-color: rgba(0, 255, 136, 0.26);
          box-shadow: 0 0 0 1px rgba(0, 255, 136, 0.08);
        }

        .docs-swagger .swagger-ui .info,
        .docs-swagger .swagger-ui .scheme-container {
          margin: 0 0 24px;
          padding: 24px;
          border-radius: 16px;
        }

        .docs-swagger .swagger-ui .info .title,
        .docs-swagger .swagger-ui .opblock-tag,
        .docs-swagger .swagger-ui .opblock-summary-path,
        .docs-swagger .swagger-ui .opblock-summary-path__deprecated,
        .docs-swagger .swagger-ui h1,
        .docs-swagger .swagger-ui h2,
        .docs-swagger .swagger-ui h3,
        .docs-swagger .swagger-ui h4,
        .docs-swagger .swagger-ui h5,
        .docs-swagger .swagger-ui p,
        .docs-swagger .swagger-ui label,
        .docs-swagger .swagger-ui table,
        .docs-swagger .swagger-ui .tab li,
        .docs-swagger .swagger-ui .model-title,
        .docs-swagger .swagger-ui .model {
          color: #e5fdf1;
        }

        .docs-swagger .swagger-ui .info a,
        .docs-swagger .swagger-ui .opblock-summary-method,
        .docs-swagger .swagger-ui .parameter__name,
        .docs-swagger .swagger-ui .response-col_status,
        .docs-swagger .swagger-ui .model-toggle,
        .docs-swagger .swagger-ui .prop-format,
        .docs-swagger .swagger-ui .property.primitive {
          color: #00ff88;
        }

        .docs-swagger .swagger-ui .opblock .opblock-summary,
        .docs-swagger .swagger-ui .models-control {
          border-color: rgba(0, 255, 136, 0.18);
        }

        .docs-swagger .swagger-ui .opblock.opblock-get,
        .docs-swagger .swagger-ui .opblock.opblock-post,
        .docs-swagger .swagger-ui .opblock.opblock-put,
        .docs-swagger .swagger-ui .opblock.opblock-delete,
        .docs-swagger .swagger-ui .opblock.opblock-patch {
          background: rgba(0, 255, 136, 0.04);
          border-color: rgba(0, 255, 136, 0.34);
        }

        .docs-swagger .swagger-ui .btn,
        .docs-swagger .swagger-ui select,
        .docs-swagger .swagger-ui input,
        .docs-swagger .swagger-ui textarea {
          background: #050505;
          border-color: rgba(0, 255, 136, 0.42);
          color: #e5fdf1;
          font-family: inherit;
        }

        .docs-swagger .swagger-ui .btn:hover,
        .docs-swagger .swagger-ui .btn.authorize,
        .docs-swagger .swagger-ui .execute-wrapper .btn.execute {
          background: #00ff88;
          border-color: #00ff88;
          color: #0a0a0a;
        }

        .docs-swagger .swagger-ui .opblock-description-wrapper p,
        .docs-swagger .swagger-ui .opblock-external-docs-wrapper p,
        .docs-swagger .swagger-ui .opblock-title_normal p,
        .docs-swagger .swagger-ui .response-col_description,
        .docs-swagger .swagger-ui .markdown p {
          color: #b7c8bf;
        }

        .docs-swagger .swagger-ui .highlight-code,
        .docs-swagger .swagger-ui .microlight,
        .docs-swagger .swagger-ui pre,
        .docs-swagger .swagger-ui code {
          background: #050505;
          color: #00ff88;
          font-family: inherit;
        }

        .docs-swagger .swagger-ui svg,
        .docs-swagger .swagger-ui .authorization__btn svg {
          fill: #00ff88;
        }
      `}</style>
      <section className="mx-auto max-w-7xl p-6 space-y-6">
        <div className="terminal-card p-5">
          <h1 className="text-text-primary text-2xl font-semibold mb-2">API Reference</h1>
          <p className="text-text-secondary text-sm">
            Live OpenAPI docs from <code className="font-mono text-accent-green">{openApiUrl}</code>. Authenticated
            requests automatically use your active session token.
          </p>
        </div>

        <div className="docs-swagger terminal-card overflow-hidden p-4">
          <SwaggerUI
            url={openApiUrl}
            docExpansion="list"
            defaultModelsExpandDepth={1}
            displayRequestDuration
            persistAuthorization
            requestInterceptor={(request) => {
              if (token) {
                request.headers = {
                  ...request.headers,
                  Authorization: `Bearer ${token}`,
                };
              }

              return request;
            }}
          />
        </div>
      </section>
    </main>
  );
};
