"use client";

import { axisBottom, axisLeft } from "d3-axis";
import { csv } from "d3-fetch";
import { scaleBand, scaleLinear, scaleOrdinal } from "d3-scale";
import { select } from "d3-selection";
import { useEffect, useRef, useState } from "react";

type Diet = "carnivore" | "herbivore" | "omnivore";

interface AnimalDatum {
  name: string;
  speed: number;
  diet: Diet;
}

const validDiets: Diet[] = ["carnivore", "herbivore", "omnivore"];

const dietColors: Record<Diet, string> = {
  carnivore: "#ef4444",
  herbivore: "#22c55e",
  omnivore: "#3b82f6",
};

const maxAnimals = 30;

export default function AnimalSpeedGraph() {
  const graphRef = useRef<HTMLDivElement>(null);
  const [animalData, setAnimalData] = useState<AnimalDatum[]>([]);

  useEffect(() => {
    void csv("/sample_animals.csv").then((raw) => {
      function isDiet(value: string): value is Diet {
        return validDiets.includes(value as Diet);
      }

      const parsed: AnimalDatum[] = [];
      for (const row of raw) {
        const name = (row.name ?? "").trim();
        const speed = Number(row.speed);
        const diet = (row.diet ?? "").toLowerCase();
        if (name.length > 0 && !isNaN(speed) && speed > 0 && isDiet(diet)) {
          parsed.push({ name, speed, diet });
        }
      }

      const sorted = parsed.sort((a, b) => b.speed - a.speed).slice(0, maxAnimals);
      setAnimalData(sorted);
    });
  }, []);

  useEffect(() => {
    if (!graphRef.current) return;
    graphRef.current.innerHTML = "";
    if (animalData.length === 0) return;

    const margin = { top: 40, right: 140, bottom: 120, left: 70 };
    const width = Math.max(graphRef.current.clientWidth, 700);
    const height = 500;
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svg = select(graphRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("style", "max-width: 100%; height: auto;");

    const chart = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = scaleBand<string>()
      .domain(animalData.map((d) => d.name))
      .range([0, chartWidth])
      .padding(0.2);

    const y = scaleLinear()
      .domain([0, Math.ceil((Math.max(...animalData.map((d) => d.speed)) * 1.1) / 10) * 10])
      .range([chartHeight, 0]);

    const color = scaleOrdinal<Diet, string>().domain(validDiets).range(Object.values(dietColors));

    chart
      .selectAll("rect")
      .data(animalData)
      .join("rect")
      .attr("x", (d) => x(d.name) ?? 0)
      .attr("y", (d) => y(d.speed))
      .attr("width", x.bandwidth())
      .attr("height", (d) => chartHeight - y(d.speed))
      .attr("fill", (d) => color(d.diet))
      .attr("rx", 2);

    chart
      .append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .attr("text-anchor", "end")
      .attr("dx", "-0.5em")
      .attr("dy", "0.25em")
      .style("font-size", "11px");

    chart
      .append("text")
      .attr("x", chartWidth / 2)
      .attr("y", chartHeight + margin.bottom - 10)
      .attr("text-anchor", "middle")
      .attr("fill", "currentColor")
      .style("font-size", "13px")
      .text("Animal");

    chart.append("g").call(axisLeft(y).ticks(8));

    chart
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -chartHeight / 2)
      .attr("y", -margin.left + 16)
      .attr("text-anchor", "middle")
      .attr("fill", "currentColor")
      .style("font-size", "13px")
      .text("Speed (km/h)");

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", 24)
      .attr("text-anchor", "middle")
      .attr("fill", "currentColor")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text(`Top ${animalData.length} Fastest Animals by Diet`);

    const legend = svg.append("g").attr("transform", `translate(${width - margin.right + 16}, ${margin.top})`);

    validDiets.forEach((diet, i) => {
      const row = legend.append("g").attr("transform", `translate(0, ${i * 24})`);
      row.append("rect").attr("width", 14).attr("height", 14).attr("rx", 2).attr("fill", color(diet));
      row
        .append("text")
        .attr("x", 20)
        .attr("y", 11)
        .attr("fill", "currentColor")
        .style("font-size", "12px")
        .text(diet.charAt(0).toUpperCase() + diet.slice(1));
    });
  }, [animalData]);

  return (
    <div
      ref={graphRef}
      className="w-full overflow-x-auto rounded border p-4"
      role="img"
      aria-label="Bar chart showing animal speeds grouped by diet type"
    />
  );
}
