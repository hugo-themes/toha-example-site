---
title: "Ch1: Introduction to Pandas"
date: 2026-08-19
categories: ["Data Analysis"]
access: private
---

## What is Pandas?

Pandas is a Python library for data manipulation and analysis. It provides data structures like DataFrame and Series.

```python
import pandas as pd

df = pd.read_csv("data.csv")
df.head()
```

## DataFrame Structure

<div style="background: #e8f5e9; border-radius: 8px; padding: 1.5rem; margin: 2rem 0; overflow-x: auto;">
  <h3 style="margin-top:0;">Demo: DataFrame Visualization</h3>
  <table id="df-demo" style="border-collapse: collapse; font-family: monospace; font-size: 0.9rem;">
    <thead>
      <tr style="background: #4caf50; color: white;">
        <th style="padding: 8px; border: 1px solid #ddd;"></th>
        <th style="padding: 8px; border: 1px solid #ddd;">name</th>
        <th style="padding: 8px; border: 1px solid #ddd;">age</th>
        <th style="padding: 8px; border: 1px solid #ddd;">score</th>
      </tr>
    </thead>
    <tbody id="df-body"></tbody>
  </table>
  <script>
    (function() {
      const data = [
        ['Alice', 25, 88], ['Bob', 30, 92],
        ['Carol', 22, 79], ['Dave', 28, 95]
      ];
      const tbody = document.getElementById('df-body');
      let row = 0;
      function addRow() {
        if (row < data.length) {
          const tr = document.createElement('tr');
          tr.style.opacity = '0';
          tr.style.transition = 'opacity 0.5s';
          tr.innerHTML = `<td style="padding:8px;border:1px solid #ddd;font-weight:bold;">${row}</td>` +
            data[row].map(v => `<td style="padding:8px;border:1px solid #ddd;">${v}</td>`).join('');
          tbody.appendChild(tr);
          requestAnimationFrame(() => tr.style.opacity = '1');
          row++;
          setTimeout(addRow, 600);
        }
      }
      addRow();
    })();
  </script>
</div>

## Basic Operations

```python
# Select a column
df["name"]

# Filter rows
df[df["age"] > 25]

# Summary statistics
df.describe()
```
