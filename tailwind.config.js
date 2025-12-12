/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores institucionales institucional actualizados
        primary: {
          50: '#fef7f8',
          100: '#fdeaea',
          200: '#fbd2d5',
          300: '#f8b2ba',
          400: '#f2858f',
          500: '#e85a6b',
          600: '#d43041',
          700: '#8B1538', // Guinda principal institucional
          800: '#6B1028', // Guinda oscuro
          900: '#4d0c1d',
        },
        secondary: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#D63384', // Rosa institucional
          600: '#B02A57', // Rosa oscuro
          700: '#9d174d',
          800: '#831843',
          900: '#701a3b',
        },
        tertiary: {
          50: '#fdf2f3',
          100: '#fce7e8',
          200: '#f9d2d4',
          300: '#f5b2b6',
          400: '#ee8590',
          500: '#e25968',
          600: '#d13441',
          700: '#722F37', // Vino principal
          800: '#5A252A', // Vino oscuro
          900: '#42191d',
        },
        // Colores específicos institucional
        institucional: {
          guinda: '#8B1538',
          'guinda-dark': '#6B1028',
          'guinda-light': '#A61E42',
          rosa: '#D63384',
          'rosa-dark': '#B02A57',
          'rosa-light': '#E85AA0',
          vino: '#722F37',
          'vino-dark': '#5A252A',
          'vino-light': '#8F3C45',
        },
        // Colores del escudo gubernamental para estadísticas
        stats: {
          morado: '#9f3f8e',
          naranja: '#fe851c',
          azul: '#5276ba',
          verde: '#00b023',
          rojo: '#ff4c64',
          amarillo: '#fec152',
          celeste: '#0797d4',
          'vino-gob': '#9d2648',
          turquesa: '#00afa5',
          blanco: '#ffffff',
        },
        // Colores del sistema actualizados
        semovi: {
          blue: '#5276ba',
          green: '#00b023',
          gray: '#64748b',
        }
      },
      fontFamily: {
        sans: ['Montserrat'],
        serif: ['Montserrat'],
        mono: ['Montserrat'],
      },
      boxShadow: {
        'institucional': '0 4px 6px -1px rgba(139, 21, 56, 0.1), 0 2px 4px -1px rgba(139, 21, 56, 0.06)',
        'institucional-lg': '0 10px 15px -3px rgba(139, 21, 56, 0.1), 0 4px 6px -2px rgba(139, 21, 56, 0.05)',
        'rosa': '0 4px 6px -1px rgba(214, 51, 132, 0.1), 0 2px 4px -1px rgba(214, 51, 132, 0.06)',
      },
      backgroundImage: {
        'gradient-institucional': 'linear-gradient(135deg, #8B1538 0%, #6B1028 100%)',
        'gradient-institucional-accent': 'linear-gradient(135deg, #D63384 0%, #B02A57 100%)',
        'gradient-header': 'linear-gradient(90deg, #8B1538 0%, #D63384 50%, #722F37 100%)',
        'gradient-institucional-triple': 'linear-gradient(135deg, #8B1538 0%, #D63384 50%, #722F37 100%)',
      }
    },
  },
  plugins: [],
}

