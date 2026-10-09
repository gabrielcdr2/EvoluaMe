import React, { createContext, useContext, useEffect, useState } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

type Tema = "light" | "dark";

type AcessibilidadeContextType = {
  tema: Tema;
  tamanhoFonte: number;
  alterarTema: (novoTema: Tema) => void;
  aumentarFonte: () => void;
  diminuirFonte: () => void;
};

const AcessibilidadeContext = createContext<
  AcessibilidadeContextType | undefined
>(undefined);

export function AcessibilidadeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [tema, setTema] = useState<Tema>("light");
  const [tamanhoFonte, setTamanhoFonte] = useState(1);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarPreferencias() {
      try {
        const temaSalvo = await AsyncStorage.getItem("@evolua_tema");

        const fonteSalva = await AsyncStorage.getItem("@evolua_fonte");

        if (temaSalvo === "light" || temaSalvo === "dark") {
          setTema(temaSalvo);
        }

        if (fonteSalva) {
          const valor = Number(fonteSalva);

          if (valor >= 0.8 && valor <= 1.5) {
            setTamanhoFonte(valor);
          }
        }
      } catch (error) {
        console.log("Erro ao carregar preferências:", error);
      } finally {
        setCarregando(false);
      }
    }

    carregarPreferencias();
  }, []);

  async function alterarTema(novoTema: Tema) {
    setTema(novoTema);

    try {
      await AsyncStorage.setItem("@evolua_tema", novoTema);
    } catch (error) {
      console.log("Erro ao salvar tema:", error);
    }
  }

  async function aumentarFonte() {
    const novoTamanho = Math.min(1.5, Number((tamanhoFonte + 0.1).toFixed(1)));

    setTamanhoFonte(novoTamanho);

    try {
      await AsyncStorage.setItem("@evolua_fonte", String(novoTamanho));
    } catch (error) {
      console.log("Erro ao salvar fonte:", error);
    }
  }

  async function diminuirFonte() {
    const novoTamanho = Math.max(0.8, Number((tamanhoFonte - 0.1).toFixed(1)));

    setTamanhoFonte(novoTamanho);

    try {
      await AsyncStorage.setItem("@evolua_fonte", String(novoTamanho));
    } catch (error) {
      console.log("Erro ao salvar fonte:", error);
    }
  }

  if (carregando) {
    return null;
  }

  return (
    <AcessibilidadeContext.Provider
      value={{
        tema,
        tamanhoFonte,
        alterarTema,
        aumentarFonte,
        diminuirFonte,
      }}
    >
      {children}
    </AcessibilidadeContext.Provider>
  );
}

export function useAcessibilidade() {
  const contexto = useContext(AcessibilidadeContext);

  if (!contexto) {
    throw new Error(
      "useAcessibilidade precisa estar dentro do AcessibilidadeProvider",
    );
  }

  return contexto;
}
