# Adding New Pages/Screens Workflow

This project uses React Navigation with TypeScript for navigation between screens. Here's how to add a new page:

## Steps to Add a New Screen:

### 1. Create the Screen Component
Create a new file in the `screens/` directory:
```
screens/YourNewScreen.tsx
```

### 2. Update Navigation Types
Add your new screen to `types/navigation.ts`:
```typescript
export type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  YourNewScreen: undefined; // Add this line
  // Or if your screen needs parameters:
  // YourNewScreen: { userId: string; name: string };
};
```

### 3. Register the Screen in App.tsx
Import and add your screen to the Stack Navigator in `App.tsx`:
```typescript
import YourNewScreen from './screens/YourNewScreen';

// Inside the Stack.Navigator:
<Stack.Screen 
  name="YourNewScreen" 
  component={YourNewScreen} 
  options={{ title: 'Your Screen Title' }}
/>
```

### 4. Navigate to Your Screen
From any other screen, use navigation to go to your new screen:
```typescript
navigation.navigate('YourNewScreen');
// Or with parameters:
// navigation.navigate('YourNewScreen', { userId: '123', name: 'John' });
```

## Current Screens:
- **Home** (`screens/HomeScreen.tsx`) - Main landing page
- **Profile** (`screens/ProfileScreen.tsx`) - User profile page

## Navigation Methods:
- `navigation.navigate('ScreenName')` - Navigate to a screen
- `navigation.goBack()` - Go back to the previous screen
- `navigation.replace('ScreenName')` - Replace current screen
- `navigation.reset()` - Reset the navigation stack

## Tips:
- Use TypeScript for type safety with navigation parameters
- Keep screen components in the `screens/` directory
- Update `types/navigation.ts` whenever you add/modify screens
- Use NativeWind classes for styling (already configured)
