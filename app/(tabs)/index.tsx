import { useState, useRef } from 'react';
import { Image } from 'expo-image';
import { Platform, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';

const MIN_COUNT = -200;
const MAX_COUNT = 200;

export default function HomeScreen() {
  const [count, setCount] = useState(0);
  const [inputValue, setInputValue] = useState('0');
  const [history, setHistory] = useState<number[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clamp = (value: number) => Math.min(MAX_COUNT, Math.max(MIN_COUNT, value));

  const clearTimers = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const updateCount = (updater: (prev: number) => number) => {
    setCount((prev) => {
      const next = clamp(updater(prev));
      if (next === prev) return prev; 
      setHistory((h) => [...h, prev]);
      setInputValue(String(next));
      return next;
    });
  };

  const startHold = (step: number) => {
    updateCount((prev) => prev + step);

    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        setCount((prev) => {
          const next = clamp(prev + step);
          if (next === prev) { 
            clearTimers();
            return prev;
          }
          setHistory((h) => [...h, prev]);
          setInputValue(String(next));
          return next;
        });
      }, 100);
    }, 350);
  };

  const stopHold = () => {
    clearTimers();
  };

  const handleReset = () => {
    setHistory((h) => [...h, count]);
    setCount(0);
    setInputValue('0');
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const handleInputChange = (text: string) => {
    if (text === '' || text === '-' || /^-?\d+$/.test(text)) {
      setInputValue(text);
    }
  };

  const handleInputBlur = () => {
    if (inputValue === '' || inputValue === '-') {
      setInputValue(String(count));
      return;
    }
    const parsed = clamp(parseInt(inputValue, 10));
    setInputValue(String(parsed));
    if (parsed !== count) {
      setHistory((h) => [...h, count]);
      setCount(parsed);
    }
  };

  const atMax = count >= MAX_COUNT;
  const atMin = count <= MIN_COUNT;

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#ffffff', dark: '#ffffff' }}
      headerImage={
        <Image
          source={require('@/assets/images/counter.png')}
          style={styles.reactLogo}
        />
      }>
    

      <ThemedView style={styles.counterContainer}>
        <TextInput
          style={styles.counterInput}
          value={inputValue}
          onChangeText={handleInputChange}
          onBlur={handleInputBlur}
          keyboardType="number-pad"
          textAlign="center"
        />

        <ThemedText style={styles.rangeHint}>
          Range: {MIN_COUNT} to {MAX_COUNT}
        </ThemedText>

        <ThemedView style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.minusButton, atMin && styles.buttonDisabled]}
            onPressIn={() => !atMin && startHold(-1)}
            onPressOut={stopHold}
            disabled={atMin}
            delayLongPress={0}>
            <ThemedText style={styles.buttonText}>－</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.resetButton]}
            onPress={handleReset}>
            <ThemedText style={styles.buttonText}>Reset</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.plusButton, atMax && styles.buttonDisabled]}
            onPressIn={() => !atMax && startHold(1)}
            onPressOut={stopHold}
            disabled={atMax}
            delayLongPress={0}>
            <ThemedText style={styles.buttonText}>＋</ThemedText>
          </TouchableOpacity>
        </ThemedView>
{/*history ng counter */}
        {history.length > 0 && (
          <ThemedView style={styles.historyContainer}>
            <ThemedView style={styles.historyHeader}>
              <ThemedText style={styles.historyTitle}>Previous values</ThemedText>
              <TouchableOpacity onPress={handleClearHistory}>
                <ThemedText style={styles.clearHistoryText}>Clear</ThemedText>
              </TouchableOpacity>
            </ThemedView>
            <ScrollView style={styles.historyScroll} nestedScrollEnabled>
              {history
                .slice()
                .reverse()
                .map((value, index) => (
                  <ThemedText key={history.length - index} style={styles.historyItem}>
                    {history.length - index}. {value}
                  </ThemedText>
                ))}
            </ScrollView>
          </ThemedView>
        )}
      </ThemedView>

    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
    reactLogo: {
    height: 320,
    width: 290,
    alignSelf: 'center',
    top: 20,
  },
  counterContainer: {
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  counterInput: {
    fontSize: 48,
    lineHeight: 56,
    fontWeight: 'bold',
    minWidth: 120,
    color: '#050204',
    borderBottomWidth: 2,
    borderBottomColor: '#18a5d3',
    paddingVertical: 4,
  },
  rangeHint: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: -10,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  minusButton: {
    backgroundColor: '#E63946',
  },
  plusButton: {
    backgroundColor: '#2A9D8F',
  },
  resetButton: {
    backgroundColor: '#6C757D',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  historyContainer: {
    width: '100%',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  historyTitle: {
    fontWeight: '600',
    opacity: 0.7,
  },
  clearHistoryText: {
    color: '#E63946',
    fontWeight: '600',
    fontSize: 14,
  },
  historyScroll: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#d71919',
    borderRadius: 8,
    padding: 8,
  },
  historyItem: {
    paddingVertical: 2,
  },
})