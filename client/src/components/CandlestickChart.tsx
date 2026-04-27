import { ResponsiveContainer, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Bar, Cell, ReferenceLine } from 'recharts';
import { format } from 'date-fns';
import { useTheme } from 'next-themes';

interface CandleData {
  index: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  time?: number | string;
}

interface CandlestickChartProps {
  data: CandleData[];
  height?: number;
  showVolume?: boolean;
  showGrid?: boolean;
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload[0]) {
    const candle = payload[0].payload;
    const isGreen = candle.close >= candle.open;
    const change = ((candle.close - candle.open) / candle.open) * 100;
    const changeAbs = Math.abs(change);
    
    return (
      <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-lg p-3 shadow-xl z-50">
        <div className="flex flex-col gap-1">
          {candle.time && (
            <div className="text-xs font-medium text-muted-foreground mb-1">
              {typeof candle.time === 'number' 
                ? format(new Date(candle.time), 'PPpp')
                : candle.time}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <TooltipItem label="Open" value={candle.open.toFixed(5)} isGreen={isGreen} isBold />
            <TooltipItem label="High" value={candle.high.toFixed(5)} isGreen={candle.high >= candle.open} />
            <TooltipItem label="Low" value={candle.low.toFixed(5)} isGreen={candle.low >= candle.open} />
            <TooltipItem label="Close" value={candle.close.toFixed(5)} isGreen={isGreen} isBold />
            
            <div className="col-span-2 pt-2 mt-1 border-t border-border/50">
              <TooltipItem 
                label="Change" 
                value={`${change >= 0 ? '+' : ''}${change.toFixed(2)}%`} 
                isGreen={isGreen}
                isBold
              />
            </div>
            
            {candle.volume !== undefined && (
              <div className="col-span-2 pt-1 mt-1">
                <TooltipItem 
                  label="Volume" 
                  value={candle.volume.toLocaleString()} 
                  isGreen={change >= 0}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const TooltipItem = ({ label, value, isGreen, isBold = false }: { label: string; value: string; isGreen: boolean; isBold?: boolean }) => (
  <>
    <span className="text-xs text-muted-foreground font-medium">{label}</span>
    <span 
      className={`text-xs ${isBold ? 'font-semibold' : 'font-medium'} font-mono`}
      style={{ color: isGreen ? 'hsl(var(--bull))' : 'hsl(var(--bear))' }}
    >
      {value}
    </span>
  </>
);

// Custom candlestick shape
const CandleShape = (props: any) => {
  const { x, y, width, height, payload } = props;
  
  if (!payload) return null;
  
  const { open, high, low, close } = payload;
  const isGreen = close >= open;
  const color = isGreen ? 'hsl(var(--bull))' : 'hsl(var(--bear))';
  
  // Calculate dimensions
  const candleWidth = Math.min(width * 0.7, 12);
  const centerX = x + width / 2;
  
  // Calculate Y positions (note: in SVG, y increases downward)
  const yScale = height / (Math.max(...props.data.map((d: any) => d.high)) - Math.min(...props.data.map((d: any) => d.low)));
  const yOffset = y;
  const dataMin = Math.min(...props.data.map((d: any) => d.low));
  
  const yHigh = yOffset + (high - dataMin) * yScale;
  const yLow = yOffset + (low - dataMin) * yScale;
  const yOpen = yOffset + (open - dataMin) * yScale;
  const yClose = yOffset + (close - dataMin) * yScale;
  
  return (
    <g className="candlestick">
      {/* High-Low line (wick) */}
      <line
        x1={centerX}
        y1={yHigh}
        x2={centerX}
        y2={yLow}
        stroke={color}
        strokeWidth={1.5}
        className="transition-opacity duration-200 opacity-80 hover:opacity-100"
      />
      {/* Open-Close body */}
      <rect
        x={centerX - candleWidth / 2}
        y={Math.min(yOpen, yClose)}
        width={candleWidth}
        height={Math.max(Math.abs(yOpen - yClose), 1)}
        fill={color}
        stroke={isGreen ? 'hsl(var(--bull-dark))' : 'hsl(var(--bear-dark))'}
        strokeWidth={0.5}
        rx={1.5}
        className="transition-all duration-200 opacity-90 hover:opacity-100"
      />
    </g>
  );
};

// Volume bars component
const VolumeBars = (props: any) => {
  const { data, x, y, width, height, fill } = props;
  
  if (!data || data.length === 0) return null;
  
  const maxVolume = Math.max(...data.map((d: any) => d.volume || 0));
  const barWidth = width / data.length;
  
  return (
    <g>
      {data.map((item: any, index: number) => {
        if (!item.volume) return null;
        
        const barHeight = (item.volume / maxVolume) * (height * 0.3); // Use 30% of the chart height for volume
        const isGreen = item.close >= item.open;
        const barColor = isGreen ? 'hsl(var(--bull)/0.3)' : 'hsl(var(--bear)/0.3)';
        const barX = x + index * barWidth + barWidth * 0.1;
        
        return (
          <rect
            key={`volume-${index}`}
            x={barX}
            y={y + height - barHeight}
            width={barWidth * 0.8}
            height={barHeight}
            fill={barColor}
            rx={1}
            className="transition-opacity duration-200 opacity-70 hover:opacity-100"
          />
        );
      })}
    </g>
  );
};

const Candle = (props: any) => {
  return null; // This component is just a placeholder for the Bar
};

export default function CandlestickChart({ 
  data, 
  height = 400,
  showVolume = true,
  showGrid = true
}: CandlestickChartProps) {
  const { theme } = useTheme();
  
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px] text-muted-foreground">
        Loading chart data...
      </div>
    );
  }

  const minPrice = Math.min(...data.map(d => d.low));
  const maxPrice = Math.max(...data.map(d => d.high));
  const priceRange = maxPrice - minPrice;
  const hasVolume = data.some(d => d.volume !== undefined);
  
  // Calculate price intervals for reference lines
  const priceStep = priceRange / 5;
  const priceLevels = Array.from({ length: 6 }, (_, i) => minPrice + (priceStep * i));

  // Format X-axis tick values
  const formatXAxis = (tick: any) => {
    if (!tick && tick !== 0) return '';
    
    // If time is available, use it for x-axis labels
    const item = data.find(d => d.index === tick);
    if (item?.time) {
      if (typeof item.time === 'number') {
        return format(new Date(item.time), 'HH:mm');
      }
      return item.time;
    }
    
    // Otherwise use the index
    return tick % Math.ceil(data.length / 5) === 0 ? tick : '';
  };

  // Calculate chart dimensions
  const chartHeight = showVolume && hasVolume ? height * 0.7 : height;
  const volumeHeight = showVolume && hasVolume ? height * 0.2 : 0;
  
  // Calculate Y-axis domain with some padding
  const yDomain = [
    minPrice - priceRange * 0.02, 
    maxPrice + priceRange * 0.02
  ];

  return (
    <div className="w-full h-full flex flex-col">
      {/* Main Price Chart */}
      <div style={{ width: '100%', height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart 
            data={data} 
            margin={{ 
              top: 10, 
              right: 10, 
              left: 10, 
              bottom: showVolume && hasVolume ? 0 : 10 
            }}
            className="candlestick-chart"
          >
            {/* Grid Lines */}
            {showGrid && (
              <CartesianGrid 
                vertical={false}
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                opacity={0.1}
              />
            )}
            
            {/* Horizontal Reference Lines */}
            {showGrid && priceLevels.map((level, i) => (
              <ReferenceLine 
                key={`ref-${i}`}
                y={level} 
                stroke="hsl(var(--border))" 
                strokeDasharray="3 3"
                strokeOpacity={0.2}
                ifOverflow="extendDomain"
              />
            ))}
            
            {/* X-Axis */}
            <XAxis 
              dataKey="index"
              axisLine={false}
              tickLine={false}
              tick={{ 
                fontSize: 10, 
                fill: 'hsl(var(--muted-foreground))',
                opacity: 0.7
              }}
              tickFormatter={formatXAxis}
              interval="preserveStartEnd"
              padding={{ left: 15, right: 15 }}
              height={20}
              minTickGap={30}
            />
            
            {/* Y-Axis */}
            <YAxis 
              domain={yDomain}
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ 
                fontSize: 10, 
                fill: 'hsl(var(--muted-foreground))',
                opacity: 0.7
              }}
              width={70}
              tickFormatter={(value) => value.toFixed(5)}
              padding={{ top: 10, bottom: 10 }}
            />
            
            {/* Tooltip */}
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ 
                stroke: 'hsl(var(--primary))', 
                strokeWidth: 1, 
                strokeDasharray: '3 3',
                strokeOpacity: 0.5
              }}
              position={{ y: 0 }}
            />
            
            {/* Candlesticks */}
            <Bar 
              dataKey="high" 
              shape={(props) => <CandleShape {...props} data={data} />}
              isAnimationActive={true}
              animationDuration={500}
              animationEasing="ease-out"
            />
            
            {/* Current price line */}
            {data.length > 0 && (
              <ReferenceLine 
                y={data[data.length - 1].close} 
                stroke="hsl(var(--primary))" 
                strokeDasharray="3 3"
                strokeOpacity={0.7}
                ifOverflow="extendDomain"
                label={{
                  value: data[data.length - 1].close.toFixed(5),
                  position: 'right',
                  fill: 'hsl(var(--foreground))',
                  fontSize: 10,
                  opacity: 0.8,
                  offset: 5
                }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      {/* Volume Chart */}
      {showVolume && hasVolume && (
        <div style={{ width: '100%', height: volumeHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart 
              data={data}
              margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary)/0.2)" />
                  <stop offset="100%" stopColor="hsl(var(--primary)/0.05)" />
                </linearGradient>
              </defs>
              
              <XAxis 
                dataKey="index"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 0 }}
                tickFormatter={() => ''}
              />
              
              <YAxis 
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))', opacity: 0.5 }}
                width={30}
                tickFormatter={(value) => {
                  const maxVol = Math.max(...data.map(d => d.volume || 0));
                  if (value === maxVol) return '';
                  return `${(value / 1000).toFixed(0)}K`;
                }}
              />
              
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload[0]) {
                    const volume = payload[0].payload.volume;
                    return (
                      <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-lg px-2 py-1 text-xs">
                        Vol: {volume?.toLocaleString()}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              
              <Bar 
                dataKey="volume"
                fill="url(#volumeGradient)"
                isAnimationActive={true}
                animationDuration={500}
                animationEasing="ease-out"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
      
      {/* Chart Controls */}
      <div className="flex items-center justify-between px-2 py-1 text-xs text-muted-foreground border-t border-border/50">
        <div className="flex gap-1">
          <span className="px-1.5 py-0.5 rounded bg-muted/50">O: {data[data.length - 1]?.open?.toFixed(5)}</span>
          <span className="px-1.5 py-0.5 rounded bg-muted/50">H: {data[data.length - 1]?.high?.toFixed(5)}</span>
          <span className="px-1.5 py-0.5 rounded bg-muted/50">L: {data[data.length - 1]?.low?.toFixed(5)}</span>
          <span 
            className="px-1.5 py-0.5 rounded font-medium"
            style={{ 
              backgroundColor: data[data.length - 1]?.close >= data[data.length - 1]?.open 
                ? 'hsl(var(--bull)/0.1)' 
                : 'hsl(var(--bear)/0.1)',
              color: data[data.length - 1]?.close >= data[data.length - 1]?.open 
                ? 'hsl(var(--bull))' 
                : 'hsl(var(--bear))'
            }}
          >
            C: {data[data.length - 1]?.close?.toFixed(5)}
          </span>
        </div>
        
        {data[0]?.time && data[data.length - 1]?.time && (
          <div className="text-xs opacity-70">
            {format(new Date(data[0].time), 'MMM d')} - {format(new Date(data[data.length - 1].time), 'MMM d, yyyy')}
          </div>
        )}
      </div>
    </div>
  );
}
