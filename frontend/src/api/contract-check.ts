import { getVersion } from "./generated/backend";

// 생성 타입이 BE 응답과 어긋나면 타입 체크에서 실패합니다. 실제 화면이 생기면 지웁니다.
export async function readVersion(): Promise<string | undefined> {
  const response = await getVersion();
  return response.data.data?.version;
}
