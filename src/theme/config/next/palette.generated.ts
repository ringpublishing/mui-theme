export const palette = {
    light: {
        mode: 'light' as const,
        text: {
            primary: 'rgba(15, 23, 42, 1)',
            secondary: 'rgba(71, 85, 105, 1)',
            disabled: 'rgba(168, 183, 204, 1)'
        },
        primary: {
            main: 'rgba(20, 80, 180, 1)',
            dark: 'rgba(0, 61, 155, 1)',
            light: 'rgba(90, 148, 244, 1)',
            contrastText: 'rgba(255, 255, 255, 1)'
        },
        secondary: {
            main: 'rgba(226, 232, 240, 1)',
            dark: 'rgba(168, 183, 204, 1)',
            light: 'rgba(241, 245, 249, 1)',
            contrastText: 'rgba(15, 23, 42, 1)'
        },
        action: {
            active: 'rgba(71, 85, 105, 1)',
            hover: 'rgba(168, 183, 204, 0.16)',
            selected: 'rgba(168, 183, 204, 0.24)',
            disabledBackground: 'rgba(168, 183, 204, 0.3)',
            focus: 'rgba(168, 183, 204, 0.3)',
            disabled: 'rgba(168, 183, 204, 0.75)',
            pressed: 'rgba(168, 183, 204, 0.45)',
            disabledBackgroundLight: 'rgba(168, 183, 204, 0.2)'
        },
        error: {
            main: 'rgba(225, 29, 72, 1)',
            dark: 'rgba(190, 18, 60, 1)',
            light: 'rgba(251, 113, 133, 1)',
            contrastText: 'rgba(255, 255, 255, 1)'
        },
        warning: {
            main: 'rgba(234, 88, 12, 1)',
            dark: 'rgba(194, 65, 12, 1)',
            light: 'rgba(251, 146, 60, 1)',
            contrastText: 'rgba(255, 255, 255, 1)'
        },
        info: {
            main: 'rgba(25, 118, 210, 1)',
            dark: 'rgba(12, 63, 142, 1)',
            light: 'rgba(33, 150, 243, 1)',
            contrastText: 'rgba(255, 255, 255, 1)'
        },
        success: {
            main: 'rgba(14, 132, 81, 1)',
            dark: 'rgba(4, 72, 56, 1)',
            light: 'rgba(20, 158, 84, 1)',
            contrastText: 'rgba(255, 255, 255, 1)'
        },
        common: {
            white: 'rgba(255, 255, 255, 1)',
            black: 'rgba(15, 23, 42, 1)',
            grey: 'rgba(233, 233, 233, 1)'
        },
        background: {
            default: 'rgba(255, 255, 255, 1)',
            paper: 'rgba(255, 255, 255, 1)',
            subtle: 'rgba(248, 250, 252, 1)'
        },
        components: {
            paper: {
                'elevation-0': 'rgba(255, 255, 255, 1)',
                'elevation-1': 'rgba(255, 255, 255, 1)',
                'elevation-2': 'rgba(255, 255, 255, 1)',
                'elevation-3': 'rgba(255, 255, 255, 1)',
                'elevation-4': 'rgba(255, 255, 255, 1)',
                'elevation-5': 'rgba(255, 255, 255, 1)',
                'elevation-6': 'rgba(255, 255, 255, 1)',
                'elevation-7': 'rgba(255, 255, 255, 1)',
                'elevation-8': 'rgba(255, 255, 255, 1)',
                'elevation-9': 'rgba(255, 255, 255, 1)',
                'elevation-10': 'rgba(255, 255, 255, 1)',
                'elevation-11': 'rgba(255, 255, 255, 1)',
                'elevation-12': 'rgba(255, 255, 255, 1)',
                'elevation-13': 'rgba(255, 255, 255, 1)',
                'elevation-14': 'rgba(255, 255, 255, 1)',
                'elevation-15': 'rgba(255, 255, 255, 1)',
                'elevation-16': 'rgba(255, 255, 255, 1)',
                'elevation-17': 'rgba(255, 255, 255, 1)',
                'elevation-18': 'rgba(255, 255, 255, 1)',
                'elevation-19': 'rgba(255, 255, 255, 1)',
                'elevation-20': 'rgba(255, 255, 255, 1)',
                'elevation-21': 'rgba(255, 255, 255, 1)',
                'elevation-22': 'rgba(255, 255, 255, 1)',
                'elevation-23': 'rgba(255, 255, 255, 1)',
                'elevation-24': 'rgba(255, 255, 255, 1)',
                'outlineBorder': 'rgba(203, 213, 225, 1)'
            },
            rating: {
                enabledBorder: 'rgba(0, 0, 0, 0.23)',
                activeFill: 'rgba(255, 180, 0, 1)'
            },
            avatar: {
                stoneFill: 'rgba(168, 183, 204, 1)',
                skyFill: 'rgba(30, 150, 190, 1)',
                lavenderFill: 'rgba(84, 56, 200, 1)',
                blushFill: 'rgba(195, 40, 153, 1)',
                coralFill: 'rgba(234, 68, 68, 1)',
                peachFill: 'rgba(248, 162, 0, 1)',
                lemonFill: 'rgba(232, 195, 0, 1)',
                sageFill: 'rgba(125, 194, 64, 1)',
                tealFill: 'rgba(77, 193, 156, 1)',
                azureFill: 'rgba(36, 115, 189, 1)'
            },
            input: {
                standard: {
                    enabledBorder: 'rgba(115, 131, 154, 1)',
                    hoverBorder: 'rgba(51, 65, 85, 1)',
                    disabledBorder: 'rgba(168, 183, 204, 1)'
                },
                filled: {
                    enabledFill: 'rgba(248, 250, 252, 1)',
                    hoverFill: 'rgba(241, 245, 249, 1)'
                },
                outlined: {
                    enabledBorder: 'rgba(115, 131, 154, 1)',
                    hoverBorder: 'rgba(51, 65, 85, 1)',
                    disabledBorder: 'rgba(168, 183, 204, 1)'
                }
            },
            switch: {
                knobFillEnabled: 'rgba(255, 255, 255, 1)',
                slideCheckedFill: 'rgba(133, 179, 255, 1)',
                knowFillDisabled: 'rgba(241, 245, 249, 1)',
                slideUncheckedFill: 'rgba(168, 183, 204, 1)'
            },
            chip: {
                outlinedHoverFill: 'rgba(241, 245, 249, 1)',
                outlinedEnabledBorder: 'rgba(168, 183, 204, 1)',
                FocusFill: 'rgba(203, 213, 225, 1)',
                PressedFill: 'rgba(203, 213, 225, 1)',
                outlinedSelectedBorder: 'rgba(90, 148, 244, 1)',
                SelectedFill: 'rgba(208, 225, 255, 1)',
                outlinedEnabledFill: 'rgba(255, 255, 255, 1)',
                filledEnabledFill: 'rgba(226, 232, 240, 1)',
                filledEnabledHover: 'rgba(203, 213, 225, 1)'
            },
            tooltip: {
                fill: 'rgba(51, 65, 85, 1)'
            },
            backdrop: {
                fill: 'rgba(15, 23, 42, 0.5)'
            },
            appBar: {
                defaultFill: 'rgba(241, 245, 249, 1)'
            },
            breadcrumbs: {
                collapseFill: 'rgba(241, 245, 249, 1)'
            },
            alert: {
                error: {
                    color: 'rgba(76, 5, 25, 1)',
                    background: 'rgba(255, 235, 238, 1)'
                },
                warning: {
                    color: 'rgba(96, 28, 10, 1)',
                    background: 'rgba(255, 247, 237, 1)'
                },
                info: {
                    color: 'rgba(12, 63, 142, 1)',
                    background: 'rgba(227, 242, 253, 1)'
                },
                success: {
                    color: 'rgba(4, 72, 56, 1)',
                    background: 'rgba(235, 255, 234, 1)'
                }
            },
            stepper: {
                connector: 'rgba(168, 183, 204, 1)'
            },
            snackbar: {
                fill: 'rgba(15, 23, 42, 1)'
            },
            table: {
                border: 'rgba(203, 213, 225, 1)'
            },
            datagrid: {
                border: 'rgba(217, 217, 217, 1)'
            },
            dataview: {
                border: 'rgba(217, 217, 217, 1)'
            },
            detail: {
                close: {
                    background: 'rgba(255, 255, 255, 1)',
                    hover: 'rgba(233, 233, 233, 1)'
                }
            },
            mediaImage: {
                actions: 'rgba(196, 196, 196, 1)',
                focusable: 'rgba(0, 0, 0, 0.1)'
            }
        },
        _native: {
            'scrollbar-bg': 'rgba(226, 232, 240, 1)'
        },
        contrast: {
            main: 'rgba(255, 255, 255, 1)',
            dark: 'rgba(255, 255, 255, 1)',
            light: 'rgba(255, 255, 255, 1)',
            contrastText: 'rgba(0, 167, 238, 1)',
            outlinedBorder: 'rgba(224, 245, 253, 1)',
            contrast: 'rgba(255, 255, 255, 1)',
            hover: 'rgba(224, 245, 253, 1)',
            selected: 'rgba(224, 245, 253, 1)',
            focus: 'rgba(176, 228, 249, 1)',
            focusVisible: 'rgba(224, 245, 253, 1)'
        },
        divider: 'rgba(203, 213, 225, 1)',
        tag: {
            stoneBackground: 'rgba(226, 232, 240, 1)',
            stoneBorder: 'rgba(168, 183, 204, 1)',
            stoneText: 'rgba(51, 65, 85, 1)',
            skyBackground: 'rgba(218, 240, 247, 1)',
            skyBorder: 'rgba(166, 218, 236, 1)',
            skyText: 'rgba(15, 78, 101, 1)',
            azureText: 'rgba(19, 59, 101, 1)',
            azureBorder: 'rgba(169, 203, 237, 1)',
            azureBackground: 'rgba(220, 234, 247, 1)',
            lavenderBackground: 'rgba(225, 219, 246, 1)',
            lavenderBorder: 'rgba(180, 167, 235, 1)',
            lavenderText: 'rgba(32, 17, 99, 1)',
            blushBackground: 'rgba(245, 216, 238, 1)',
            blushBorder: 'rgba(231, 159, 213, 1)',
            blushText: 'rgba(107, 8, 63, 1)',
            coralBackground: 'rgba(251, 212, 212, 1)',
            coralBorder: 'rgba(245, 153, 153, 1)',
            coralText: 'rgba(145, 0, 0, 1)',
            peachBackground: 'rgba(255, 237, 208, 1)',
            peachBorder: 'rgba(255, 218, 148, 1)',
            peachText: 'rgba(135, 68, 10, 1)',
            lemonBackground: 'rgba(255, 249, 208, 1)',
            lemonBorder: 'rgba(255, 243, 51, 1)',
            lemonText: 'rgba(135, 92, 10, 1)',
            sageBackground: 'rgba(235, 248, 225, 1)',
            sageBorder: 'rgba(207, 237, 181, 1)',
            sageText: 'rgba(64, 100, 34, 1)',
            tealBackground: 'rgba(223, 245, 238, 1)',
            tealBorder: 'rgba(177, 231, 214, 1)',
            tealText: 'rgba(27, 93, 72, 1)'
        }
    },
    dark: {
        mode: 'dark' as const,
        text: {
            primary: 'rgba(255, 255, 255, 1)',
            secondary: 'rgba(255, 255, 255, 0.7)',
            disabled: 'rgba(255, 255, 255, 0.38)'
        },
        primary: {
            main: 'rgba(175, 205, 255, 1)',
            dark: 'rgba(133, 179, 255, 1)',
            light: 'rgba(229, 239, 255, 1)',
            contrastText: 'rgba(0, 0, 0, 0.87)'
        },
        secondary: {
            main: 'rgba(206, 147, 216, 1)',
            dark: 'rgba(171, 71, 188, 1)',
            light: 'rgba(243, 229, 245, 1)',
            contrastText: 'rgba(0, 0, 0, 0.87)'
        },
        action: {
            active: 'rgba(255, 255, 255, 1)',
            hover: 'rgba(255, 255, 255, 0.08)',
            selected: 'rgba(255, 255, 255, 0.16)',
            disabledBackground: 'rgba(255, 255, 255, 0.12)',
            focus: 'rgba(255, 255, 255, 0.12)',
            disabled: 'rgba(255, 255, 255, 0.3)',
            pressed: 'rgba(255, 255, 255, 0.12)',
            disabledBackgroundLight: 'rgba(255, 255, 255, 0.12)'
        },
        error: {
            main: 'rgba(244, 63, 94, 1)',
            dark: 'rgba(190, 18, 60, 1)',
            light: 'rgba(253, 164, 175, 1)',
            contrastText: 'rgba(255, 255, 255, 1)'
        },
        warning: {
            main: 'rgba(251, 146, 60, 1)',
            dark: 'rgba(194, 65, 12, 1)',
            light: 'rgba(253, 186, 116, 1)',
            contrastText: 'rgba(0, 0, 0, 0.87)'
        },
        info: {
            main: 'rgba(66, 165, 245, 1)',
            dark: 'rgba(25, 118, 210, 1)',
            light: 'rgba(100, 181, 246, 1)',
            contrastText: 'rgba(0, 0, 0, 0.87)'
        },
        success: {
            main: 'rgba(28, 184, 85, 1)',
            dark: 'rgba(8, 106, 80, 1)',
            light: 'rgba(77, 212, 113, 1)',
            contrastText: 'rgba(0, 0, 0, 0.87)'
        },
        common: {
            white: 'rgba(255, 255, 255, 1)',
            black: 'rgba(0, 0, 0, 1)',
            grey: 'rgba(67, 67, 67, 1)'
        },
        background: {
            default: 'rgba(18, 18, 18, 1)',
            paper: 'rgba(18, 18, 18, 1)',
            subtle: 'rgba(18, 18, 18, 1)'
        },
        components: {
            paper: {
                'elevation-0': 'rgba(18, 18, 18, 1)',
                'elevation-1': 'rgba(30, 30, 30, 1)',
                'elevation-2': 'rgba(35, 35, 35, 1)',
                'elevation-3': 'rgba(37, 37, 37, 1)',
                'elevation-4': 'rgba(39, 39, 39, 1)',
                'elevation-5': 'rgba(42, 42, 42, 1)',
                'elevation-6': 'rgba(44, 44, 44, 1)',
                'elevation-7': 'rgba(44, 44, 44, 1)',
                'elevation-8': 'rgba(46, 46, 46, 1)',
                'elevation-9': 'rgba(46, 46, 46, 1)',
                'elevation-10': 'rgba(49, 49, 49, 1)',
                'elevation-11': 'rgba(49, 49, 49, 1)',
                'elevation-12': 'rgba(51, 51, 51, 1)',
                'elevation-13': 'rgba(51, 51, 51, 1)',
                'elevation-14': 'rgba(51, 51, 51, 1)',
                'elevation-15': 'rgba(51, 51, 51, 1)',
                'elevation-16': 'rgba(54, 54, 54, 1)',
                'elevation-17': 'rgba(54, 54, 54, 1)',
                'elevation-18': 'rgba(54, 54, 54, 1)',
                'elevation-19': 'rgba(54, 54, 54, 1)',
                'elevation-20': 'rgba(56, 56, 56, 1)',
                'elevation-21': 'rgba(56, 56, 56, 1)',
                'elevation-22': 'rgba(56, 56, 56, 1)',
                'elevation-23': 'rgba(56, 56, 56, 1)',
                'elevation-24': 'rgba(56, 56, 56, 1)',
                'outlineBorder': 'rgba(255, 255, 255, 0.12)'
            },
            rating: {
                enabledBorder: 'rgba(255, 255, 255, 0.23)',
                activeFill: 'rgba(255, 180, 0, 1)'
            },
            avatar: {
                stoneFill: 'rgba(71, 85, 105, 1)',
                skyFill: 'rgba(255, 255, 255, 0.38)',
                lavenderFill: 'rgba(255, 255, 255, 0.38)',
                blushFill: 'rgba(255, 255, 255, 0.38)',
                coralFill: 'rgba(255, 255, 255, 0.38)',
                peachFill: 'rgba(255, 255, 255, 0.38)',
                lemonFill: 'rgba(255, 255, 255, 0.38)',
                sageFill: 'rgba(255, 255, 255, 0.38)',
                tealFill: 'rgba(255, 255, 255, 0.38)',
                azureFill: 'rgba(255, 255, 255, 0.38)'
            },
            input: {
                standard: {
                    enabledBorder: 'rgba(255, 255, 255, 0.42)',
                    hoverBorder: 'rgba(255, 255, 255, 1)',
                    disabledBorder: 'rgba(255, 255, 255, 1)'
                },
                filled: {
                    enabledFill: 'rgba(255, 255, 255, 0.09)',
                    hoverFill: 'rgba(255, 255, 255, 0.12)'
                },
                outlined: {
                    enabledBorder: 'rgba(255, 255, 255, 0.23)',
                    hoverBorder: 'rgba(255, 255, 255, 1)',
                    disabledBorder: 'rgba(255, 255, 255, 1)'
                }
            },
            switch: {
                knobFillEnabled: 'rgba(203, 213, 225, 1)',
                slideCheckedFill: 'rgba(255, 255, 255, 0.38)',
                knowFillDisabled: 'rgba(71, 85, 105, 1)',
                slideUncheckedFill: 'rgba(255, 255, 255, 0.38)'
            },
            chip: {
                outlinedHoverFill: 'rgba(255, 255, 255, 0.12)',
                outlinedEnabledBorder: 'rgba(51, 65, 85, 1)',
                FocusFill: 'rgba(255, 255, 255, 0.2)',
                PressedFill: 'rgba(255, 255, 255, 0.2)',
                outlinedSelectedBorder: 'rgba(51, 65, 85, 1)',
                SelectedFill: 'rgba(51, 65, 85, 1)',
                outlinedEnabledFill: 'rgba(51, 65, 85, 1)',
                filledEnabledFill: 'rgba(51, 65, 85, 1)',
                filledEnabledHover: 'rgba(51, 65, 85, 1)'
            },
            tooltip: {
                fill: 'rgba(97, 97, 97, 0.9)'
            },
            backdrop: {
                fill: 'rgba(15, 23, 42, 0.5)'
            },
            appBar: {
                defaultFill: 'rgba(39, 39, 39, 1)'
            },
            breadcrumbs: {
                collapseFill: 'rgba(71, 85, 105, 1)'
            },
            alert: {
                error: {
                    color: 'rgba(244, 199, 199, 1)',
                    background: 'rgba(22, 11, 11, 1)'
                },
                warning: {
                    color: 'rgba(255, 226, 183, 1)',
                    background: 'rgba(25, 18, 7, 1)'
                },
                info: {
                    color: 'rgba(184, 231, 251, 1)',
                    background: 'rgba(7, 19, 24, 1)'
                },
                success: {
                    color: 'rgba(204, 232, 205, 1)',
                    background: 'rgba(12, 19, 13, 1)'
                }
            },
            stepper: {
                connector: 'rgba(71, 85, 105, 1)'
            },
            snackbar: {
                fill: 'rgba(44, 44, 44, 1)'
            },
            table: {
                border: 'rgba(81, 81, 81, 1)'
            },
            datagrid: {
                border: 'rgba(123, 123, 123, 1)'
            },
            dataview: {
                border: 'rgba(123, 123, 123, 1)'
            },
            detail: {
                close: {
                    background: 'rgba(0, 0, 0, 1)',
                    hover: 'rgba(38, 38, 38, 1)'
                }
            },
            mediaImage: {
                actions: 'rgba(196, 196, 196, 1)'
            }
        },
        _native: {
            'scrollbar-bg': 'rgba(51, 65, 85, 1)'
        },
        contrast: {
            main: 'rgba(255, 255, 255, 1)',
            dark: 'rgba(255, 255, 255, 1)',
            light: 'rgba(255, 255, 255, 1)',
            contrastText: 'rgba(0, 167, 238, 1)',
            outlinedBorder: 'rgba(224, 245, 253, 1)',
            contrast: 'rgba(255, 255, 255, 1)',
            hover: 'rgba(224, 245, 253, 1)',
            selected: 'rgba(224, 245, 253, 1)',
            focus: 'rgba(176, 228, 249, 1)',
            focusVisible: 'rgba(224, 245, 253, 1)'
        },
        divider: 'rgba(255, 255, 255, 0.12)',
        tag: {
            stoneBackground: 'rgba(255, 255, 255, 0.38)',
            stoneBorder: 'rgba(255, 255, 255, 0.38)',
            stoneText: 'rgba(255, 255, 255, 0.38)',
            skyBackground: 'rgba(255, 255, 255, 0.38)',
            skyBorder: 'rgba(255, 255, 255, 0.38)',
            skyText: 'rgba(255, 255, 255, 0.38)',
            azureText: 'rgba(255, 255, 255, 0.38)',
            azureBorder: 'rgba(255, 255, 255, 0.38)',
            azureBackground: 'rgba(255, 255, 255, 0.38)',
            lavenderBackground: 'rgba(255, 255, 255, 0.38)',
            lavenderBorder: 'rgba(255, 255, 255, 0.38)',
            lavenderText: 'rgba(255, 255, 255, 0.38)',
            blushBackground: 'rgba(255, 255, 255, 0.38)',
            blushBorder: 'rgba(255, 255, 255, 0.38)',
            blushText: 'rgba(255, 255, 255, 0.38)',
            coralBackground: 'rgba(255, 255, 255, 0.38)',
            coralBorder: 'rgba(255, 255, 255, 0.38)',
            coralText: 'rgba(255, 255, 255, 0.38)',
            peachBackground: 'rgba(255, 255, 255, 0.38)',
            peachBorder: 'rgba(255, 255, 255, 0.38)',
            peachText: 'rgba(255, 255, 255, 0.38)',
            lemonBackground: 'rgba(255, 255, 255, 0.38)',
            lemonBorder: 'rgba(255, 255, 255, 0.38)',
            lemonText: 'rgba(255, 255, 255, 0.38)',
            sageBackground: 'rgba(255, 255, 255, 0.38)',
            sageBorder: 'rgba(255, 255, 255, 0.38)',
            sageText: 'rgba(255, 255, 255, 0.38)',
            tealBackground: 'rgba(255, 255, 255, 0.38)',
            tealBorder: 'rgba(255, 255, 255, 0.38)',
            tealText: 'rgba(255, 255, 255, 0.38)'
        }
    }
};
