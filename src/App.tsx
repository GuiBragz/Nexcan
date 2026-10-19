import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Html5Qrcode } from "html5-qrcode";
import "./App.css";

// ==================================================
// TIPOS
// ==================================================

type ScanStatus = "idle" | "scanning" | "result";

type ScanResult = {
  content: string;
  type: "link" | "file" | "text";
};

type FileInfo = {
  extension: string;
  label: string;
};

// ==================================================
// CONFIGURAÇÕES
// ==================================================

const PORTFOLIO_URL = "https://guibraga.com.br";

const FILE_TYPES: Record<string, string> = {
  pdf: "Documento PDF",
  doc: "Documento Word",
  docx: "Documento Word",
  xls: "Planilha Excel",
  xlsx: "Planilha Excel",
  csv: "Arquivo CSV",
  txt: "Arquivo de texto",
  zip: "Arquivo ZIP",
  rar: "Arquivo RAR",
  "7z": "Arquivo compactado",
  png: "Imagem PNG",
  jpg: "Imagem JPG",
  jpeg: "Imagem JPEG",
  webp: "Imagem WebP",
  gif: "Imagem GIF",
  svg: "Imagem SVG",
  mp3: "Áudio MP3",
  wav: "Áudio WAV",
  mp4: "Vídeo MP4",
  mov: "Vídeo MOV",
};

// ==================================================
// IDENTIFICAÇÃO DE CONTEÚDO
// ==================================================

function getFileInfo(url: URL): FileInfo | null {
  const filename = url.pathname.split("/").pop() || "";

  let decodedFilename = filename;

  try {
    decodedFilename = decodeURIComponent(filename);
  } catch {
    // Mantém o nome original.
  }

  if (!decodedFilename.includes(".")) {
    return null;
  }

  const extension = decodedFilename.split(".").pop()?.toLowerCase();

  if (!extension || !FILE_TYPES[extension]) {
    return null;
  }

  return {
    extension,
    label: FILE_TYPES[extension],
  };
}

function analyzeContent(content: string): ScanResult {
  const normalizedContent = content.trim();

  try {
    const url = new URL(normalizedContent);

    if (url.protocol === "https:" || url.protocol === "http:") {
      const fileInfo = getFileInfo(url);

      return {
        content: normalizedContent,
        type: fileInfo ? "file" : "link",
      };
    }
  } catch {
    // O conteúdo não é uma URL válida.
  }

  return {
    content,
    type: "text",
  };
}

// ==================================================
// APLICAÇÃO
// ==================================================

function App() {
  const [status, setStatus] = useState<ScanStatus>("idle");

  const [result, setResult] = useState<ScanResult | null>(null);

  const [error, setError] = useState("");
  const [copyMessage, setCopyMessage] = useState("");

  const [cameraReady, setCameraReady] = useState(false);

  const [readingFile, setReadingFile] = useState(false);

  // Identifica cada sessão da câmera.
  const scanSession = useRef(0);

  // Referência ao campo de seleção de imagens.
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ==================================================
  // LEITURA PELA CÂMERA
  // ==================================================

  useEffect(() => {
    if (status !== "scanning") {
      return;
    }

    const session = ++scanSession.current;

    const scanner = new Html5Qrcode("nexcan-reader", false);

    let disposed = false;
    let codeDetected = false;

    let startPromise: Promise<null> | null = null;
    let stopPromise: Promise<void> | null = null;

    async function stopCamera() {
      if (stopPromise) {
        return stopPromise;
      }

      stopPromise = (async () => {
        // Se a câmera ainda estiver iniciando,
        // aguarda a conclusão antes de encerrá-la.
        if (startPromise) {
          try {
            await startPromise;
          } catch {
            // A inicialização pode ter falhado.
          }
        }

        try {
          if (scanner.isScanning) {
            await scanner.stop();
          }
        } catch (err) {
          console.error("Erro ao desligar a câmera:", err);
        }

        try {
          scanner.clear();
        } catch {
          // O leitor pode já estar encerrado.
        }
      })();

      return stopPromise;
    }

    function handleQrDetected(decodedText: string) {
      if (codeDetected || disposed) {
        return;
      }

      // Impede leituras duplicadas.
      codeDetected = true;

      void (async () => {
        // REGRA PRINCIPAL DO NEXCAN:
        // encerra a câmera antes de mostrar o resultado.
        await stopCamera();

        if (disposed || scanSession.current !== session) {
          return;
        }

        setCameraReady(false);
        setResult(analyzeContent(decodedText));
        setCopyMessage("");
        setStatus("result");
      })();
    }

    async function startCamera() {
      try {
        startPromise = scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: (width, height) => {
              const size = Math.max(
                50,
                Math.floor(Math.min(width, height) * 0.75),
              );

              return {
                width: size,
                height: size,
              };
            },
          },
          handleQrDetected,
          () => {
            // Ignora quadros sem QR Code.
          },
        );

        await startPromise;

        if (disposed || codeDetected) {
          await stopCamera();
          return;
        }

        setCameraReady(true);
      } catch (err) {
        if (disposed) {
          return;
        }

        console.error("Erro ao iniciar a câmera:", err);

        await stopCamera();

        if (disposed || scanSession.current !== session) {
          return;
        }

        setCameraReady(false);

        setError(
          "Não foi possível acessar a câmera. " +
            "Verifique as permissões do navegador.",
        );

        setStatus("idle");
      }
    }

    void startCamera();

    return () => {
      disposed = true;
      scanSession.current++;

      void stopCamera();
    };
  }, [status]);

  // ==================================================
  // CONTROLES DA CÂMERA
  // ==================================================

  function startScan() {
    if (readingFile) {
      return;
    }

    setError("");
    setResult(null);
    setCopyMessage("");
    setCameraReady(false);

    setStatus("scanning");
  }

  function cancelScan() {
    setCameraReady(false);
    setStatus("idle");
  }

  // ==================================================
  // LEITURA DE QR CODE POR IMAGEM
  // ==================================================

  async function readQrImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    // Permite escolher a mesma imagem novamente.
    event.target.value = "";

    if (!file || readingFile || status === "scanning") {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Selecione um arquivo de imagem válido.");
      return;
    }

    setReadingFile(true);
    setError("");
    setCopyMessage("");

    const scanner = new Html5Qrcode("nexcan-file-reader", false);

    try {
      const decodedText = await scanner.scanFile(file, true);

      setResult(analyzeContent(decodedText));
      setStatus("result");
    } catch (err) {
      console.error("Erro ao interpretar a imagem:", err);

      setError(
        "Não encontramos um QR Code legível nessa " +
          "imagem. Tente outra imagem com maior nitidez.",
      );

      setStatus("idle");
    } finally {
      try {
        scanner.clear();
      } catch {
        // A leitura do arquivo já terminou.
      }

      setReadingFile(false);
    }
  }

  // ==================================================
  // COPIAR RESULTADO
  // ==================================================

  async function copyResult() {
    if (!result) {
      return;
    }

    try {
      await navigator.clipboard.writeText(result.content);

      setCopyMessage("Conteúdo copiado!");
    } catch {
      setCopyMessage("Não foi possível copiar o conteúdo.");
    }
  }

  // ==================================================
  // DETALHES DO RESULTADO
  // ==================================================

  const resultUrl =
    result && result.type !== "text" ? result.content.trim() : null;

  const parsedResultUrl = resultUrl ? new URL(resultUrl) : null;

  const resultHost = parsedResultUrl?.hostname ?? null;

  const fileInfo =
    parsedResultUrl && result?.type === "file"
      ? getFileInfo(parsedResultUrl)
      : null;

  // ==================================================
  // INTERFACE
  // ==================================================

  return (
    <div className="app">
      {/* HEADER */}

      <header className="header">
        <div className="brand">
          <div className="brand-icon">
            <img src="/nexcan-icon.png" alt="Ícone Nexcan" />
          </div>
          <span>NEXCAN</span>
        </div>

        <span className="header-tag">QR CODE READER</span>
      </header>

      <main className="main">
        {/* Leitor usado para imagens enviadas.
            Fica fora da área visível da tela,
            mas mantém dimensões para a biblioteca. */}

        <div
          id="nexcan-file-reader"
          className="file-reader-hidden"
          aria-hidden="true"
        />

        {/* APRESENTAÇÃO */}

        <div className="intro">
          <span className="eyebrow">SIMPLES. RÁPIDO. SEGURO.</span>

          <h1>
            Escaneie.
            <br />
            <span>Descubra.</span>
          </h1>

          <p>
            Leia QR Codes e descubra o conteúdo por trás de cada código. Você
            decide o que abrir.
          </p>
        </div>

        {/* PAINEL PRINCIPAL */}

        <section className="scanner-card">
          {/* ESTADO INICIAL */}

          {status === "idle" && (
            <div className="scanner-content">
              <div className="qr-placeholder">⌗</div>

              <h2>Pronto para escanear?</h2>

              <p>Use sua câmera ou selecione uma imagem com QR Code.</p>

              {error && (
                <p className="scanner-error" role="alert">
                  {error}
                </p>
              )}

              <button
                type="button"
                className="primary-button"
                onClick={startScan}
                disabled={readingFile}
              >
                Ativar câmera →
              </button>

              {/* ENVIO DE IMAGEM */}

              <div className="upload-section">
                <span className="upload-divider">OU</span>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={readQrImage}
                  className="file-input-hidden"
                  aria-label="Selecionar imagem com QR Code"
                />

                <button
                  type="button"
                  className="secondary-button"
                  disabled={readingFile}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {readingFile
                    ? "Analisando imagem..."
                    : "Enviar imagem com QR Code"}
                </button>
              </div>
            </div>
          )}

          {/* CÂMERA ATIVA */}

          {status === "scanning" && (
            <div className="scanner-content">
              <div id="nexcan-reader" className="camera-reader" />

              <h2>
                {cameraReady ? "Aguardando QR Code..." : "Iniciando câmera..."}
              </h2>

              <p>Posicione o QR Code dentro da área de leitura.</p>

              <button
                type="button"
                className="secondary-button"
                onClick={cancelScan}
              >
                Cancelar leitura
              </button>
            </div>
          )}

          {/* RESULTADO DA LEITURA */}

          {status === "result" && result && (
            <div className="scanner-content">
              <div className="success-icon">✓</div>

              <span className="success-label">QR CODE IDENTIFICADO</span>

              <h2>Leitura concluída!</h2>

              <p>
                Confira o conteúdo identificado. Nenhum link foi aberto
                automaticamente.
              </p>

              {/* CLASSIFICAÇÃO */}

              <div className="result-type">
                {result.type === "file" && "ARQUIVO"}
                {result.type === "link" && "LINK"}
                {result.type === "text" && "TEXTO"}
              </div>

              {/* DOMÍNIO DE ORIGEM */}

              {resultHost && (
                <div className="result-origin">
                  <span>ORIGEM DO LINK</span>

                  <strong>{resultHost}</strong>
                </div>
              )}

              {/* TIPO DE ARQUIVO */}

              {fileInfo && (
                <div className="result-file-type">{fileInfo.label}</div>
              )}

              {/* CONTEÚDO ORIGINAL */}

              <div className="result-box">{result.content}</div>

              {/* AÇÕES */}

              <div className="result-actions">
                {resultUrl && (
                  <>
                    <a
                      className="primary-button"
                      href={resultUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      referrerPolicy="no-referrer"
                    >
                      {result.type === "file"
                        ? "Abrir arquivo ↗"
                        : "Abrir site ↗"}
                    </a>

                    {result.type === "file" && (
                      <a
                        className="secondary-button"
                        href={resultUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        referrerPolicy="no-referrer"
                        title="O navegador pode abrir o arquivo caso o servidor não permita download direto"
                      >
                        Baixar arquivo ↓
                      </a>
                    )}
                  </>
                )}

                <button
                  type="button"
                  className="secondary-button"
                  onClick={copyResult}
                >
                  Copiar
                </button>
              </div>

              {/* FEEDBACK DE CÓPIA */}

              {copyMessage && (
                <p role="status" className="copy-message">
                  {copyMessage}
                </p>
              )}

              {/* AVISO PARA ARQUIVOS */}

              {result.type === "file" && (
                <p className="file-note">
                  O download depende das permissões do servidor onde o arquivo
                  está hospedado. Caso não seja permitido, o navegador poderá
                  abrir o arquivo normalmente.
                </p>
              )}

              {/* NOVA LEITURA */}

              <button type="button" className="text-button" onClick={startScan}>
                Ler outro QR Code
              </button>
            </div>
          )}
        </section>

        {/* PRIVACIDADE */}

        <div className="privacy-note">
          <span>●</span>A câmera é utilizada somente durante a leitura.
        </div>
      </main>

      {/* FOOTER */}

      <footer className="footer">
        <span>© {new Date().getFullYear()} Nexcan</span>

        <span>
          Desenvolvido por{" "}
          <a
            href={PORTFOLIO_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#a3ffcc",
              fontWeight: 600,
              textDecoration: "none",
              transition: "color 0.2s ease",
            }}
          >
            Guilherme Braga ↗
          </a>
        </span>
      </footer>
    </div>
  );
}

export default App;
