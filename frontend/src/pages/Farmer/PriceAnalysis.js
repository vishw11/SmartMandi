import React, { useState, useEffect } from 'react';
import styles from './PriceAnalysis.module.css';
import { getPriceAnalysis } from '../../api/mockApi';

const PriceAnalysis = () => {
  const [filters, setFilters] = useState({ product: 'Organic Tomatoes', timeRange: 'Last 7 Days' });
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    async function load() {
      const res = await getPriceAnalysis(filters.product, filters.timeRange);
      setAnalysis(res);
    }
    load();
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  if (!analysis) return <div style={{padding:20}}>Loading analysis...</div>;

  const trendClass = analysis.priceTrend > 0 ? styles.trendUp : styles.trendDown;

  return (
    <div className={styles.container}>
      <h1 className={styles.logo}>SmartMandi</h1>
      <h2 className={styles.title}>Produce Price Analysis</h2>
      <p className={styles.subtitle}>Gain insights into market prices and optimize your selling strategy.</p>

      <div className={styles.analysisCard}>
        <h3 className={styles.sectionTitle}>Analysis Filters</h3>
        <div className={styles.filters}>
            <div className={styles.filterGroup}>
                <label className={styles.label}>Select Produce*</label>
                <select name="product" value={filters.product} onChange={handleFilterChange} className={styles.selectInput}>
                    <option value="Organic Tomatoes">Organic Tomatoes</option>
                    <option value="Premium Wheat">Premium Wheat</option>
                </select>
            </div>
            <div className={styles.filterGroup}>
                <label className={styles.label}>Time Range</label>
                <select name="timeRange" value={filters.timeRange} onChange={handleFilterChange} className={styles.selectInput}>
                    <option value="Last 7 Days">Last 7 Days</option>
                    <option value="Last 30 Days">Last 30 Days</option>
                </select>
            </div>
            <button className={styles.applyButton}>Apply Analysis</button>
        </div>

        <div className={styles.metrics}>
            <div className={styles.metricBox}>
                <p className={styles.metricLabel}>Avg. Market Price (₹/kg)</p>
                <p className={styles.metricValue}>{analysis.avgMarketPrice.toFixed(2)}</p>
            </div>
            <div className={styles.metricBox}>
                <p className={styles.metricLabel}>Your Avg. Selling Price (₹/kg)</p>
                <p className={styles.metricValue}>{analysis.avgSellingPrice.toFixed(2)}</p>
            </div>
            <div className={styles.metricBox}>
                <p className={styles.metricLabel}>Highest Recorded Price (₹/kg)</p>
                <p className={styles.metricValue}>{analysis.highestPrice.toFixed(2)}</p>
            </div>
        </div>

        <p className={styles.trendIndicator}>Price Trend (30 Days): <span className={trendClass}>{analysis.priceTrend.toFixed(1)}%</span></p>

        <h3 className={styles.sectionTitle}>Price Trend (30 Days)</h3>
        <div className={styles.chartPlaceholder}>
            [Detailed Price Trend Chart for {filters.product}]
        </div>
      </div>
    </div>
  );
};

export default PriceAnalysis;
