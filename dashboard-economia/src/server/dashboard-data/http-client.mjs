import http from 'node:http';
import https from 'node:https';

class HttpStatusError extends Error {
  constructor(status) {
    super(`HTTP ${status}`);
    this.name = 'HttpStatusError';
    this.status = status;
  }
}

class RequestTimeoutError extends Error {
  constructor() {
    super('Request timed out');
    this.name = 'RequestTimeoutError';
  }
}

class JsonParseError extends Error {
  constructor(cause, bodyPreview) {
    super('Invalid JSON response');
    this.name = 'JsonParseError';
    this.cause = cause;
    this.bodyPreview = bodyPreview;
  }
}

export async function fetchJson(url, { timeout, sourceName }) {
  const maxAttempts = 2;
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const body = await requestText(url, timeout);

      try {
        return JSON.parse(body);
      } catch (error) {
        throw new JsonParseError(error, body.slice(0, 240));
      }
    } catch (error) {
      lastError = error;

      if (!isRetryableError(error) || attempt === maxAttempts) {
        throw buildSourceError(sourceName, error, attempt);
      }
    }
  }

  throw buildSourceError(sourceName, lastError, maxAttempts);
}

function requestText(url, timeout) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'http:' ? http : https;
    const request = client.get(
      parsedUrl,
      {
        headers: {
          Accept: 'application/json',
        },
      },
      (response) => {
        const statusCode = response.statusCode ?? 500;

        if (
          statusCode >= 300 &&
          statusCode < 400 &&
          response.headers.location
        ) {
          response.resume();
          resolve(
            requestText(
              new URL(response.headers.location, parsedUrl).toString(),
              timeout,
            ),
          );
          return;
        }

        if (statusCode >= 400) {
          response.resume();
          reject(new HttpStatusError(statusCode));
          return;
        }

        let data = '';
        response.setEncoding('utf8');
        response.on('data', (chunk) => {
          data += chunk;
        });
        response.on('end', () => {
          resolve(data);
        });
      },
    );

    request.setTimeout(timeout, () => {
      request.destroy(new RequestTimeoutError());
    });

    request.on('error', reject);
  });
}

function buildSourceError(sourceName, error) {
  if (error instanceof HttpStatusError) {
    return new Error(`Erro na fonte: ${sourceName} (HTTP ${error.status})`);
  }

  if (error instanceof RequestTimeoutError) {
    return new Error(`Fonte indisponivel: ${sourceName} (timeout)`);
  }

  if (error instanceof JsonParseError) {
    return new Error(
      `Erro ao interpretar resposta da fonte: ${sourceName} (JSON invalido; inicio do body: ${JSON.stringify(error.bodyPreview)})`,
    );
  }

  if (error instanceof Error && isRetryableError(error)) {
    return new Error(
      `Fonte indisponivel: ${sourceName} (${error.code ?? error.name ?? 'erro de rede'})`,
    );
  }

  return new Error(`Fonte indisponivel: ${sourceName}`);
}

function isRetryableError(error) {
  if (error instanceof RequestTimeoutError) {
    return true;
  }

  if (!(error instanceof Error)) {
    return false;
  }

  return ['ECONNRESET', 'ETIMEDOUT', 'ECONNABORTED'].includes(error.code ?? '');
}
